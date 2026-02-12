/**
 * アクセストークン管理サービス
 */

import { AccessTokensRepository } from '../db/repositories/access-tokens';
import { withTransactionSync } from '../db/transaction';
import { generateAccessToken, hashPassword } from '../shared/utils/crypto';
import { getEnv } from '../shared/utils/env';
import { getServer } from './server';

/**
 * アクセストークンをローテーション
 */
export function rotateToken(serverId: number): {
  success: boolean;
  newToken?: string;
  errorMessage?: string;
} {
  // サーバーの存在確認
  const server = getServer(serverId);
  if (!server) {
    return {
      success: false,
      errorMessage: 'Server not found',
    };
  }

  const newToken = withTransactionSync((db) => {
    const tokensRepo = new AccessTokensRepository(db);

    // アクセストークンの存在確認
    const existingToken = tokensRepo.findByServerId(serverId);
    if (!existingToken) {
      throw new Error('Access token not found for this server');
    }

    // 新しいトークン生成
    const token = generateAccessToken();
    const tokenHash = hashPassword(token);
    const tokenPrefix = token.substring(0, 8);

    // 有効期限の計算
    const { TOKEN_EXPIRES_SECONDS } = getEnv();
    const expiresAt =
      TOKEN_EXPIRES_SECONDS === 0
        ? null
        : new Date(Date.now() + TOKEN_EXPIRES_SECONDS * 1000).toISOString();

    // トークン更新
    const updated = tokensRepo.updateByServerId(serverId, {
      tokenHash,
      tokenPrefix,
      expiresAt,
    });

    if (!updated) {
      throw new Error('Failed to update access token');
    }

    return token;
  });

  return {
    success: true,
    newToken,
  };
}
