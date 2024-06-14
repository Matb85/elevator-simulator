import { Elevator, type ElevatorConfigI, type DisplayDataI } from "@/models/Elevator";
import { Passenger } from "@/models/Passenger";
import { scheduleElevator } from "@/scheduler";
import { CallType, Dir, Strategies } from "@/utils";
import { Call } from "@/models/Call";
import { DEBUG } from "@/settings";
import { FloorTracker } from "@/models/FloorTracker";

export type { ElevatorConfigI, DisplayDataI };

/**
 * The main class that puts all the components of the algorithm together
 */
export class ElevatorSystem {
  private N: number = 0; // Number of floors
  private L: number = 0; // Number of elevators
  private strategy: Strategies; // Desired algorithm

  private elevatorGroup: Elevator[] = []; // An array of L elevators
  private floors: FloorTracker; // An array of N floors

  /**
   * Updates the strategy.
   */
  public setStrategy(strategy: Strategies) {
    this.strategy = strategy;
  }

  /**
   * Creates L Elevator objects in the elevatorGroup array.
   */
  public setElevators(L: number, c: ElevatorConfigI): void {
    for (let i = 0; i < this.elevatorGroup.length; ++i) {
      this.elevatorGroup[i].destroy();
    }

    this.elevatorGroup = [];
    this.L = L;

    for (let i = 0; i < this.L; ++i) {
      setTimeout(() => {
        const el = new Elevator(i, this.strategy, c, this.N, this.L, this.floors);
        this.elevatorGroup.push(el);
      }, i * 50);
    }
  }

  /**
   * @returns elevators that are currently running
   */
  public getElevators(): Elevator[] {
    return this.elevatorGroup;
  }

  /**
   * Creates N Floor objects in the floors array.
   */
  public setFloors(N: number): void {
    this.N = N;
    this.floors = new FloorTracker(N);
  }

  /**
   * @returns how many people are waiting and how man people are expected on every floor
   */
  public getStatus(): FloorTracker {
    return this.floors;
  }

  /**
   * Create a Passenger object (simulating a passenger arriving at a floor and pressing a button).
   * Generate Passenger ID.
   *
   * Randomly select the direction in which the passenger wants to go from the entryCall.
   * Randomly select the floor number for entryCall. - Type 1
   *
   * Set the direction of the exitFloor to be the same as the direction of the entryCall.
   * Randomly select the floor number for exitFloor, but make sure the floor number is
   * in the direction of the exitFloor. - Type 0
   *
   * Remember to assign passage number to the entryCall and exitFloor.
   * Assign Passenger ID to each call.
   */
  public async generatePassenger(entryFloor: number, exitFloor: number): Promise<void> {
    const ID = Math.round(Math.random() * 10 ** 6) + ""; // Create passenger ID

    const direction = entryFloor > exitFloor ? Dir.DOWN : Dir.UP;

    const entryCall = new Call(CallType.ENTRY, entryFloor, direction, ID);

    //console.log("entryFloor", entryFloor);
    this.floors.peopleWaiting[entryFloor] += 1;
    this.floors.peopleExpected[exitFloor] += 1;

    if (DEBUG) {
      console.log(exitFloor);
    }

    const exitCall = new Call(CallType.EXIT, exitFloor, direction, ID);

    const pas = new Passenger(entryCall, exitCall, ID); // Create a Passenger object and add it the to the passengers array
    let chosenElevator = 0;

    // The chosen elevator will be given a task (receive job)
    chosenElevator = await scheduleElevator(this.elevatorGroup, pas);

    this.elevatorGroup[chosenElevator].receiveJob(pas); // Assign a passenger to an elevator
  }
}
