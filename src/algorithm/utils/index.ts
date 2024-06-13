export function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function getRandomFloor(N: number) {
  return Math.round(Math.random() * (N - 1));
}

export enum Strategies {
  BEFORE_AFTERNOON,
  AFTER_AFTERNOON,
}

export enum Dir {
  DOWN,
  UP,
}

export enum CallType {
  EXIT,
  ENTRY,
}
