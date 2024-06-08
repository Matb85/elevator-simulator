export function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function getRandomFloor(N: number) {
  return Math.round(Math.random() * (N - 1));
}

export enum Strategies {
  ROUND_ROBIN,
  THREE_PASSAGE,
  ZONING,
  UP_PEAK_THREAD,
}

export enum Dir {
  // 0 is down
  DOWN,
  // 1 is up
  UP,
}

export enum CallType {
  EXIT,
  ENTRY,
}
