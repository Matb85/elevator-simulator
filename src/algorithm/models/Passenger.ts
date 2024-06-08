import type { Call } from "./Call";

export class Passenger {
  private entryCall: Call;
  private exitCall: Call;
  private ID: string;

  constructor(entryCall: Call, exitCall: Call, ID: string) {
    this.entryCall = entryCall;
    this.exitCall = exitCall;
    this.ID = ID;
  }

  public getID(): string {
    return this.ID;
  }

  public getEntryCall(): Call {
    return this.entryCall;
  }

  public getExitCall(): Call {
    return this.exitCall;
  }
}
