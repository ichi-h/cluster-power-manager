/**
 * 電源管理サービス
 */

import { CurrentStatus, PowerStatus } from '../db/schema';
import { calculateCurrentStatus } from './heartbeat';
import { getServer, updatePowerStatus } from './server';
import { sendWakeOnLan } from './wol';

/**
 * サーバー電源ON
 */
export async function turnOn(serverId: number): Promise<{
  success: boolean;
  errorMessage?: string;
}> {
  // サーバー取得
  const server = getServer(serverId);
  if (!server) {
    return {
      success: false,
      errorMessage: 'Server not found',
    };
  }

  // 現在のステータスを計算
  const currentStatus = calculateCurrentStatus(server);

  // Applying, Starting, Stopping状態の場合はブロック
  if (
    currentStatus === CurrentStatus.Applying ||
    currentStatus === CurrentStatus.Starting ||
    currentStatus === CurrentStatus.Stopping
  ) {
    return {
      success: false,
      errorMessage: `Cannot turn on server in ${currentStatus} state`,
    };
  }

  // Wake-on-LANマジックパケット送信
  try {
    await sendWakeOnLan(server.mac_address);
  } catch (error) {
    return {
      success: false,
      errorMessage: `Failed to send Wake-on-LAN packet: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  // 電源ステータスをONに更新
  updatePowerStatus(serverId, PowerStatus.ON);

  return { success: true };
}

/**
 * サーバー電源OFF
 */
export function turnOff(serverId: number): {
  success: boolean;
  errorMessage?: string;
} {
  // サーバー取得
  const server = getServer(serverId);
  if (!server) {
    return {
      success: false,
      errorMessage: 'Server not found',
    };
  }

  // 現在のステータスを計算
  const currentStatus = calculateCurrentStatus(server);

  // Applying, Starting, Stopping状態の場合はブロック
  if (
    currentStatus === CurrentStatus.Applying ||
    currentStatus === CurrentStatus.Starting ||
    currentStatus === CurrentStatus.Stopping
  ) {
    return {
      success: false,
      errorMessage: `Cannot turn off server in ${currentStatus} state`,
    };
  }

  // 電源ステータスをOFFに更新
  updatePowerStatus(serverId, PowerStatus.OFF);

  // Agentがマニフェストを読み取ってシャットダウン

  return { success: true };
}
