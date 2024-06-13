import type { CallType, Dir } from "@/utils";

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
