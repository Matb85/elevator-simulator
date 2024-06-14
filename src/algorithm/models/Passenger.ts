import type { Call } from "@/models/Call";

/**
 * symbolizes passenger's needs and wants
 */
export class Passenger {
  /**
   * stores information about which floor the person wants to enter the lift
   */
  private entryCall: Call;
  /**
   * stores information about which floor the person wants to exit the lift
   */
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
