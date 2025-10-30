import { hashStringToInt } from "./hash";

export function inRolloutPercent(userId: string, percent: number): boolean {
  const n = hashStringToInt(userId);
  // 0..99 mapping for a simple percentage bucket
  const bucket = n % 100;
  return bucket < Math.max(0, Math.min(100, percent));
}
