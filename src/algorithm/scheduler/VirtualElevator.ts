import { Call } from "@/models/Call";
import { DEBUG } from "@/settings";
import { Dir, CallType } from "@/utils";
import { CallPriorityQueue } from "@/utils/PriorityQueue";

import type { Elevator, ElevatorConfigI } from "../models/Elevator";

export class VirtualElevator {
  private exitCalls: Call[] = [];
  public sequence: CallPriorityQueue = new CallPriorityQueue();

  public ID: number;
  public currentFloor: number;
  public direction: Dir = Dir.UP;
  public idle = true;

  public c: ElevatorConfigI;
  public N: number;
  public L: number;

  public currentPassengers: number[] = [];

  public cost = 0;
  sleep(cost: number) {
    this.cost += cost;
  }

  constructor(el: Elevator) {
    this.ID = el.getID();
    this.N = el.N;
    this.L = el.L;
    this.c = el.getConfig();

    this.currentFloor = el.getCurrentFloor();
    this.sequence.push(...el.sequence.getHeap());
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
  public performJob(): void {
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
    this.sleep(this.c.loadingTime);

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
      this.sleep(this.c.velocity * this.c.interFloorHeight * 200);

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

      this.currentPassengers = this.currentPassengers.filter(x => x != this.currentFloor);
    }

    this.sleep(this.c.unloadingTime);

    this.idle = true;
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
}
