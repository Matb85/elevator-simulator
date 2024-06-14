import type { CallType, Dir } from "@/utils";

/**
 * symbolizes a request of a passenger. There are 2 types of calls:
 *
 * - entry Call - on which floor a person wants to enter the elevator
 * - exit Call - on which floor a person wants to exit the elevator
 *
 * A call also has a direction, either up or down
 *
 * Moreover, there are 3 possible priorities of calls:
 *
 * 1. Priority 0 (served first) - the person is waiting above the elevator that is going up
 * 2. Priority 1 - the person wants to go down, and the elevator is going down
 * 3. Priority 2 (served last) - the person wants to go up but is below the elevator that is going down
 *
 * A call can also be special - if so it is handled first regardless of anything else
 */
export class Call {
  private type: CallType;
  private passage: number = 0; // 1- P1, 2 - P2, 3 - P3
  private floor: number; // floor call - from where, car call - to where
  private direction: Dir;
  private ID: string;
  private specialCall: boolean;

  constructor(type: CallType, floor: number, direction: number, ID: string) {
    this.type = type;
    this.floor = floor;
    this.direction = direction;
    this.ID = ID;
    this.specialCall = false;
  }

  public setPassage(passage: number): void {
    this.passage = passage;
  }

  public getType(): CallType {
    return this.type;
  }

  public getFloor(): number {
    return this.floor;
  }

  public getPassage(): number {
    return this.passage;
  }

  public getDirection(): Dir {
    return this.direction;
  }

  public getID(): string {
    return this.ID;
  }

  public setSpecialCall(specialCall: boolean) {
    this.specialCall = specialCall;
  }

  public isSpecialCall(): boolean {
    return this.specialCall;
  }
}
