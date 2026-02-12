/**
 * レート制限ミドルウェアのテスト
 */

import { beforeEach, describe, expect, test } from 'bun:test';
import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  AgentRateLimiter,
  InMemoryRateLimiter,
} from '../../infrastructure/rate-limiter';
import {
  createAgentRateLimitMiddleware,
  createRateLimitMiddleware,
} from '../rate-limit';

describe('rateLimitMiddleware', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let limiter: InMemoryRateLimiter;
  let replySent = false;
  let replyCode = 200;
  let replyBody: unknown = null;

  beforeEach(() => {
    limiter = new InMemoryRateLimiter();
    replySent = false;
    replyCode = 200;
    replyBody = null;

    mockRequest = {
      ip: '192.168.1.1',
    };

    mockReply = {
      code: (statusCode: number) => {
        replyCode = statusCode;
        return mockReply as FastifyReply;
      },
      send: (body: unknown) => {
        replySent = true;
        replyBody = body;
        return mockReply as FastifyReply;
      },
    };
  });

  test('ブロックされていないIPアドレスは通過する', async () => {
    const middleware = createRateLimitMiddleware(limiter);

    await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(replySent).toBe(false);
  });

  test('ブロックされたIPアドレスは429エラーを返す', async () => {
    const ipAddress = '192.168.1.1';

    // 5回失敗してブロック
    for (let i = 0; i < 5; i++) {
      limiter.recordAttempt(ipAddress, false);
    }

    // ブロック状態を確認
    expect(limiter.isBlocked(ipAddress)).toBe(true);

    const middleware = createRateLimitMiddleware(limiter);
    await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(replySent).toBe(true);
    expect(replyCode).toBe(429);
    expect(replyBody).toEqual({
      error: 'Too many login attempts. Please try again later.',
    });
  });

  test('異なるIPアドレスは独立して処理される', async () => {
    const ip1 = '192.168.1.1';
    const ip2 = '192.168.1.2';

    // ip1をブロック
    for (let i = 0; i < 5; i++) {
      limiter.recordAttempt(ip1, false);
    }

    const middleware = createRateLimitMiddleware(limiter);

    // ip2のリクエスト
    const mockRequest2: Partial<FastifyRequest> = {
      ip: ip2,
    };
    await middleware(mockRequest2 as FastifyRequest, mockReply as FastifyReply);

    expect(replySent).toBe(false);
  });
});

describe('agentRateLimitMiddleware', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let limiter: AgentRateLimiter;
  let replySent = false;
  let replyCode = 200;
  let replyBody: unknown = null;

  beforeEach(() => {
    limiter = new AgentRateLimiter();
    replySent = false;
    replyCode = 200;
    replyBody = null;

    mockRequest = {
      ip: '192.168.1.1',
    };

    mockReply = {
      code: (statusCode: number) => {
        replyCode = statusCode;
        return mockReply as FastifyReply;
      },
      send: (body: unknown) => {
        replySent = true;
        replyBody = body;
        return mockReply as FastifyReply;
      },
    };
  });

  test('制限内のリクエストは通過する', async () => {
    const middleware = createAgentRateLimitMiddleware(limiter);

    await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(replySent).toBe(false);
  });

  test('制限を超えたリクエストは429エラーを返す', async () => {
    const ipAddress = '192.168.1.1';

    // 120回リクエストして制限いっぱいにする
    for (let i = 0; i < 120; i++) {
      limiter.recordRequest(ipAddress);
    }

    const middleware = createAgentRateLimitMiddleware(limiter);
    await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(replySent).toBe(true);
    expect(replyCode).toBe(429);
    expect(replyBody).toEqual({
      error: 'Too many requests. Please try again later.',
    });
  });

  test('異なるIPアドレスは独立して処理される', async () => {
    const ip1 = '192.168.1.1';
    const ip2 = '192.168.1.2';

    // ip1を制限いっぱいにする
    for (let i = 0; i < 120; i++) {
      limiter.recordRequest(ip1);
    }

    const middleware = createAgentRateLimitMiddleware(limiter);

    // ip2のリクエスト
    const mockRequest2: Partial<FastifyRequest> = {
      ip: ip2,
    };
    await middleware(mockRequest2 as FastifyRequest, mockReply as FastifyReply);

    expect(replySent).toBe(false);
  });
});
