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

export interface ElevatorConfigI {
  passengerLoadingTime: number; // Always 1 second
  passengerUnloadingTime: number; // Always 1 second
  velocity: number; // Always 1 meter per second
  capacity: number; // The capacity if always 1/4 of the entire building population
  interFloorHeight: number; // Always 3 meters
}
