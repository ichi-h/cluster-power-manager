/**
 * レート制限ミドルウェア
 * IPアドレスベースのログイン試行回数制限
 */

import type { FastifyReply, FastifyRequest } from 'fastify';
import type {
  IGenericRateLimiter,
  IRateLimiter,
} from '../infrastructure/rate-limiter';
import { agentRateLimiter, rateLimiter } from '../infrastructure/rate-limiter';

/**
 * レート制限ミドルウェアを作成するファクトリ関数
 */
export const createRateLimitMiddleware = (limiter: IRateLimiter) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const ipAddress = request.ip;

    if (limiter.isBlocked(ipAddress)) {
      return reply.code(429).send({
        error: 'Too many login attempts. Please try again later.',
      });
    }
  };
};

/**
 * デフォルトのレート制限ミドルウェア
 */
export const rateLimitMiddleware = createRateLimitMiddleware(rateLimiter);

/**
 * エージェント用レート制限ミドルウェアを作成するファクトリ関数
 */
export const createAgentRateLimitMiddleware = (
  limiter: IGenericRateLimiter,
) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const ipAddress = request.ip;

    if (!limiter.recordRequest(ipAddress)) {
      return reply.code(429).send({
        error: 'Too many requests. Please try again later.',
      });
    }
  };
};

/**
 * エージェント用レート制限ミドルウェア
 */
export const agentRateLimitMiddleware =
  createAgentRateLimitMiddleware(agentRateLimiter);
