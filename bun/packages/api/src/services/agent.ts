/**
 * Agent API サービス
 * エージェントからのリクエストを処理
 */

import { HeartbeatStatus } from '../db/schema';
import { logger } from '../shared/utils/logger';
import { updateHeartbeatStatus } from './heartbeat';
import { getServer } from './server';

/**
 * マニフェスト取得
 * エージェントが起動時に呼び出し、サーバーの電源ステータスとハートビート間隔を取得
 */
export function getManifest(serverId: number): {
  power_status: number;
  heartbeat_interval: number;
} | null {
  const server = getServer(serverId);

  if (!server) {
    logger.error({
      type: 'agent',
      procedure: 'GetManifest',
      message: 'Server not found',
      serverId,
    });
    return null;
  }

  logger.info({
    type: 'agent',
    procedure: 'GetManifest',
    message: 'Manifest retrieved',
    serverId,
    powerStatus: server.power_status,
    heartbeatInterval: server.heartbeat_interval,
  });

  return {
    power_status: server.power_status,
    heartbeat_interval: server.heartbeat_interval,
  };
}

/**
 * ハートビート送信
 * エージェントが定期的に呼び出し、ステータスを報告
 */
export function sendHeartbeat(
  serverId: number,
  heartbeatStatus: number,
): {
  success: boolean;
  message: string;
} {
  // heartbeat_statusの範囲チェック (1-4)
  if (
    heartbeatStatus < HeartbeatStatus.None ||
    heartbeatStatus > HeartbeatStatus.Stopping
  ) {
    logger.error({
      type: 'agent',
      procedure: 'SendHeartbeat',
      message: 'Invalid heartbeat status',
      serverId,
      heartbeatStatus,
    });

    return {
      success: false,
      message: 'Invalid heartbeat_status value (must be 1-4)',
    };
  }

  // ハートビートステータス更新
  updateHeartbeatStatus(serverId, heartbeatStatus);

  logger.info({
    type: 'agent',
    procedure: 'SendHeartbeat',
    message: 'Heartbeat received',
    serverId,
    heartbeatStatus,
  });

  return {
    success: true,
    message: '',
  };
}
