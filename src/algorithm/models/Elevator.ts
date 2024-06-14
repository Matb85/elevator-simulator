import { Call } from "@/models/Call";
import type { Passenger } from "@/models/Passenger";
import { DEBUG } from "@/settings";
import { sleep, Strategies, Dir, CallType } from "@/utils";
import { CallPriorityQueue } from "@/utils/PriorityQueue";
import type { FloorTracker } from "@/models/FloorTracker";

export interface DisplayDataI {
  ID: number;
  currentFloor: number;
  peopleWaiting: number[];
  peopleExpected: number[];
  direction: Dir;
  currentPassengers: number;
}

export interface ElevatorConfigI {
  /**
   * how long it takes for the passengers to enter the elevator
   * @type unit: milliseconds
   */
  loadingTime: number;
  /**
   * how long it takes for the passengers to exit the elevator
   * @type unit: milliseconds
   */
  unloadingTime: number;
  /**
   * average speed of the elevator
   * @type unit: meters per second
   */
  velocity: number;
  /**
   * height of every floor
   * @type unit: meters
   */
  interFloorHeight: number;
  /**
   * how many passengers can the elevator fit inside
   */
  capacity: number;
  /**
   * a callback for retrieving current elevator data
   */
  animate: (c: DisplayDataI) => Promise<void>;
}

/**
 * implements the logic of elevators
 */
export class Elevator {
  private RUNNING = true;

  private entryCalls: Call[] = [];
  private exitCalls: Call[] = [];

  private ID: number;
  private currentFloor: number;
  private direction: Dir = Dir.UP;
  private idle = true;
  private c: ElevatorConfigI;

  private currentPassengers: number[] = [];
  private floors: FloorTracker;

  public sequence: CallPriorityQueue = new CallPriorityQueue();
  public N: number;
  public L: number;

  constructor(ID: number, strategy: Strategies, c: ElevatorConfigI, N: number, L: number, floorTracker: FloorTracker) {
    this.ID = ID;
    this.N = N;
    this.L = L;
    this.c = c;

    this.currentFloor = Math.floor(N / 2);
    this.floors = floorTracker;

    this.startPolling();
    if (strategy == Strategies.AFTER_AFTERNOON) {
      // Start this thread only if user chose Up-peak
      this.upPeakThread();
    } else {
      // Start this thread only if user chose Zoning
      this.zoningThread();
    }
    this.animateElevator();
  }

  /**
   *
   * @returns elevator's ID
   */
  public getID(): number {
    return this.ID;
  }

  /**
   *
   * @returns elevator's configuration
   */
  public getConfig(): ElevatorConfigI {
    return this.c;
  }

  /**
   *
   * @returns how many passengers are inside the elevator in the moment
   */
  public getCurrentPassengers(): number[] {
    return this.currentPassengers;
  }

  /**
   *
   * @returns which floor the elevator is on in the moment
   */
  public getCurrentFloor(): number {
    return this.currentFloor;
  }

  /**
   *
   * @returns whether the elevator is idle or occupied
   */
  public isIdle(): boolean {
    return this.idle;
  }

  /**
   * destroys the instance by stopping the while loops
   */
  public destroy(): void {
    this.RUNNING = false;
    this.entryCalls = [];
    this.exitCalls = [];
  }

  /**
   * Responsible for sorting performing awaiting calls
   */
  private async startPolling(): Promise<void> {
    while (this.RUNNING) {
      this.performJob();
      await sleep(200);
    }
  }

  /**
   * Generates a exitCall with floor 0 in order to relocate the car to the lobby.
   * The idea is to reduce the waiting time for future passengers arriving at the lobby.
   */
  private async upPeakThread(): Promise<void> {
    while (this.RUNNING) {
      // Check if the elevator is idle
      if (this.idle) {
        // Wait 7 seconds
        await sleep(4000);
        // Check if the elevator is still idle and
        // is not already on the main floor
        if (this.idle && this.currentFloor != 0) {
          // Create the exitCall and add it to the sequence
          const tempCall = new Call(0, 0, 0, "");
          tempCall.setPassage(1);
          tempCall.setSpecialCall(true);

          this.sequence.push(tempCall);
        }
      }

      await sleep(200);
    }
  }

  /**
   * Elevators in idle state are repositioned to the zone’s lowest floor.
   */
  private async zoningThread(): Promise<void> {
    const Z = Math.ceil(this.N / this.L);

    while (this.RUNNING) {
      // Check if the elevator is idle
      //console.log(this.ID, this.sequence.getHeap(), this.idle);
      if (this.idle) {
        // Wait 7 seconds
        await sleep(4000);
        //console.log(this.ID, this.idle, Z, this.currentFloor, this.ID * Z);
        // Check if the elevator is still idle and
        // is not already in it's zone
        if (this.idle && this.currentFloor != this.ID * Z) {
          // Create the exitCall and add it to the sequence
          const tempCall = new Call(0, this.ID * Z, 0, "");
          tempCall.setPassage(1);
          tempCall.setSpecialCall(true);

          this.sequence.push(tempCall);
        }
      }

      await sleep(200);
    }
  }

  /**
   * Checks the sequence queue to find any Calls that need to be removed or added.
   */
  private checkSequence(curCall: Call): void {
    // Here we are looking for the exitCall of the current entryCall
    if (
      curCall.getType() == CallType.ENTRY &&
      curCall.getFloor() == this.currentFloor &&
      this.currentPassengers.length < this.c.capacity
    ) {
      this.floors.peopleWaiting[curCall.getFloor()] -= 1;

      // Traverse carFloors array to look for a
      // exitCall with the same ID as tempCall
      for (let i = 0; i < this.exitCalls.length; ++i) {
        const tempExitCall = this.exitCalls[i];

        if (tempExitCall.getID() != curCall.getID()) continue;

        this.setExitCallPassage(tempExitCall);
        this.currentPassengers.push(tempExitCall.getFloor());
        // Add exitCall to sequence
        this.sequence.push(tempExitCall);
        // Remove exitCall from exitCalls array
        this.exitCalls.splice(i, 1);
        break;
      }
      this.sequence.remove(curCall);
    }

    if (DEBUG) {
      console.log(curCall);
      console.log("checksequence---------------------------");
      console.log(this.sequence.getHeap().map(x => (x.getType() == 1 ? "entry" : "exit")));
      console.log(this.sequence.getHeap().map(x => (x.getDirection() == 1 ? "up" : "down")));
      console.log(this.sequence.getHeap().map(x => x.getPassage()));
      console.log(this.sequence.getHeap().map(x => x.getFloor()));
      console.log(this.sequence.getHeap().map(x => x.getID()));
    }

    // Check the Calls in the sequence, if the sequence is not empty
    // Here we are looking for all exitCalls and entryCalls that can be removed from sequence
    if (this.sequence.isEmpty()) return;

    // Traverse the Calls in the sequence to find out if
    // any Calls need to be remove, because their floor matches the currentFloor of the elevator
    const thisFloorCalls = this.sequence.getHeap().filter(x => x.getFloor() == this.currentFloor);
    for (const tempCall of thisFloorCalls) {
      // Remove all exitCalls whose floor is the current floor of the elevator
      // The passengers whose exitCall is the same as currentFloor have already arrived
      if (tempCall.getType() == CallType.EXIT) {
        this.sequence.remove(tempCall);
        continue;
      }

      // Remove all entryCalls whose floor is the current floor of the elevator,
      // and add exitCalls with the same ID to the sequence
      // The passengers whose entryCall is the same as currentFloor have boarded the elevator
      // and pressed a button inside the elevator (made a exitCall)
      if (
        tempCall.getType() == CallType.ENTRY &&
        tempCall.getFloor() == curCall.getFloor() &&
        this.currentPassengers.length < this.c.capacity
      ) {
        // Traverse carFloors array
        for (let i = 0; i < this.exitCalls.length; ++i) {
          const tempExitCall = this.exitCalls[i];

          if (tempExitCall.getID() != tempCall.getID()) continue;
          this.setExitCallPassage(tempExitCall);

          this.currentPassengers.push(tempExitCall.getFloor());
          // Add exitCall to sequence
          this.sequence.push(tempExitCall);
          // Remove exitCall from exitCalls array
          this.exitCalls.splice(i, 1);
          break;
        }

        // Remove the entryCall from the sequence
        //console.log("decreasing");
        this.floors.peopleWaiting[curCall.getFloor()] -= 1;
        this.sequence.remove(tempCall);
      }
    }
    if (DEBUG) {
      console.log("checksequence2---------------------------");
      console.log(this.currentFloor);
      console.log(this.sequence.getHeap().map(x => (x.getType() == 1 ? "entry" : "exit")));
      console.log(this.sequence.getHeap().map(x => (x.getDirection() == 1 ? "up" : "down")));
      console.log(this.sequence.getHeap().map(x => x.getPassage()));
      console.log(this.sequence.getHeap().map(x => x.getFloor()));
      console.log(this.sequence.getHeap().map(x => x.getID()));
      console.log("---------------------------");
    }
  }

  /**
   * Simulates the elevator moving through the shaft
   */
  private async performJob(): Promise<void> {
    if (this.sequence.size() == 0 || !this.idle) return;
    // Get Call from sequence
    const tempCall = this.sequence.peek()!;

    if (DEBUG) {
      console.log("\n\n**************************");
      console.log(`Elevator ${this.ID}, direction: ${this.direction}, current floor: ${this.currentFloor}.\n`);
      console.log(
        `Got a Job | direction: ${tempCall.getDirection()}, passage: ${tempCall.getPassage()}, floor: ${tempCall.getFloor()}, type: ${tempCall.getType()}, ID: ${tempCall.getID()}, upPeakCall: ${tempCall.isSpecialCall()}.\n`
      );
      console.log("**************************\n\n");
    }

    if (tempCall.getFloor() == this.currentFloor) {
      this.checkSequence(tempCall);
      this.idle = true;
      return;
    }

    this.idle = false;
    // Update the direction of the elevator based
    // on the position of the current floor
    // Since the direction has changed, we must
    // reassign passage to all calls in the sequence
    if (tempCall.getFloor() < this.currentFloor) this.direction = Dir.DOWN;
    else this.direction = Dir.UP;

    this.redefinePassage();
    await sleep(this.c.loadingTime);

    // Simulate elevator movement through the floors of the building
    while (this.currentFloor != tempCall.getFloor() && this.currentFloor >= 0 && this.currentFloor <= this.N - 1) {
      this.idle = false;
      // Direction is up
      if (this.direction == Dir.UP && this.currentFloor != this.N - 1) {
        this.currentFloor += 1;
      } else if (this.direction == Dir.DOWN && this.currentFloor != 0) {
        this.currentFloor -= 1;
      } else {
        console.log("\n\n\n\n! + ! + ! Elevator is out of range - this.performJob() ! + ! + !\n\n\n\n");
        break;
      }
      await sleep(this.c.velocity * this.c.interFloorHeight * 200);

      if (DEBUG) {
        console.log(
          `\n\n+++++ Elevator ${this.ID}, direction: ${this.direction}, current floor: ${this.currentFloor}, target floor: ${tempCall.getFloor()}. +++++\n`
        );
        console.log(
          `+++++ Call direction: ${tempCall.getDirection()}, Call passage: ${tempCall.getPassage()}, Call floor: ${tempCall.getFloor()}, Call type: ${tempCall.getType()}, Call ID: ${tempCall.getID()}. +++++\n\n`
        );
      }
      this.redefinePassage();
      this.checkSequence(tempCall);

      const passengersBefore = this.currentPassengers.length;
      this.currentPassengers = this.currentPassengers.filter(x => x != this.currentFloor);
      this.floors.peopleExpected[this.currentFloor] -= passengersBefore - this.currentPassengers.length;

      this.animateElevator();
    }

    setTimeout(() => {
      this.idle = true;
    }, this.c.unloadingTime);
  }

  /**
   * Breaks apart the Passenger object.
   * Puts Passenger.entryCall to the entryCalls array.
   * Puts Passenger.exitCall to the exitCalls array.
   */
  public receiveJob(pas: Passenger): void {
    const entryCall = pas.getEntryCall(); // Has floor, needs passage
    const exitCall = pas.getExitCall(); // Has floor, needs passage

    this.exitCalls.push(exitCall);

    this.setEntryCallPassage(entryCall);
    this.sequence.push(entryCall);

    if (DEBUG) {
      console.log("--------------------------");
      for (const call of this.sequence.getHeap()) {
        console.log(
          `+++++ Call direction: ${call.getDirection()}, Call passage: ${call.getPassage()}, Call floor: ${call.getFloor()}, Call type: ${call.getType()}, Call ID: ${call.getID()}. +++++\n\n`
        );
      }
      console.log("--------------------------");
      for (const call of this.entryCalls) {
        console.log(
          `+++++ Call direction: ${call.getDirection()}, Call passage: ${call.getPassage()}, Call floor: ${call.getFloor()}, Call type: ${call.getType()}, Call ID: ${call.getID()}. +++++\n\n`
        );
      }
      console.log("--------------------------");
      for (const call of this.exitCalls) {
        console.log(
          `+++++ Call direction: ${call.getDirection()}, Call passage: ${call.getPassage()}, Call floor: ${call.getFloor()}, Call type: ${call.getType()}, Call ID: ${call.getID()}. +++++\n\n`
        );
      }
      console.log("--------------------------");
    }
  }

  /**
   * Assigns passage to calls in the sequence
   */
  private redefinePassage(): void {
    for (const tempCall of this.sequence.getHeap()) {
      if (!tempCall.isSpecialCall()) this.setEntryCallPassage(tempCall);
    }
  }

  private setExitCallPassage(tempExitCall: Call) {
    // Assign passage to exitCall
    // Same direction and higher than currentFloor - P1
    // Opposite direction - P2

    if (this.direction == Dir.UP) {
      if (tempExitCall.getFloor() > this.currentFloor && tempExitCall.getDirection() == this.direction) {
        tempExitCall.setPassage(1);
      } else {
        tempExitCall.setPassage(2);
      }
    } else {
      if (tempExitCall.getFloor() < this.currentFloor && tempExitCall.getDirection() == this.direction) {
        tempExitCall.setPassage(1);
      } else {
        tempExitCall.setPassage(2);
      }
    }
  }

  private setEntryCallPassage(tempCall: Call) {
    // Assign passage to a newly arrived entryCall

    // Same direction and higher than currentFloor - P1
    // Opposite direction - P2
    // Same direction and lower than currentFloor - P3
    if (this.direction == Dir.UP) {
      if (tempCall.getFloor() > this.currentFloor && tempCall.getDirection() == this.direction) {
        tempCall.setPassage(1);
      } else if (tempCall.getFloor() < this.currentFloor && tempCall.getDirection() == this.direction) {
        tempCall.setPassage(3);
      } else {
        tempCall.setPassage(2);
      }
    } else {
      // Same direction and lower than currentFloor - P1
      // Opposite direction - P2
      // Same direction and higher than currentFloor - P3
      if (tempCall.getFloor() < this.currentFloor && tempCall.getDirection() == this.direction) {
        tempCall.setPassage(1);
      } else if (tempCall.getFloor() > this.currentFloor && tempCall.getDirection() == this.direction) {
        tempCall.setPassage(3);
      } else {
        tempCall.setPassage(2);
      }
    }
  }

  private animateElevator() {
    this.c.animate({
      ID: this.ID,
      currentFloor: this.currentFloor,
      peopleWaiting: this.floors.peopleWaiting,
      peopleExpected: this.floors.peopleExpected,
      currentPassengers: this.currentPassengers.length,
      direction: this.direction,
    });
  }
}
