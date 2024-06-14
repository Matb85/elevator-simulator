import { sleep } from "@/utils";
import { Elevator } from "@/models/Elevator";
import { VirtualElevator } from "@/scheduler/VirtualElevator";
import type { Passenger } from "@/models/Passenger";

/**
 * Elevator Scheduling.
 *
 * Estimates the costs that would result from assigning the new call to the elevator.
 *
 * Stop costs are static and include the period of time necessary for opening the door,
 * unloading and loading each one passenger and closing the door.
 *
 * In case every elevator already reached 80% load (number of calls > 80% elevator capacity),
 * calls will not get assigned until at least one elevator falls below this mark.
 *
 * The call is assigned to the elevator with the lowest cost.
 *
 * @returns the ID of the elevator to assign the passenger to
 */
export async function scheduleElevator(elevatorGroup: Elevator[], pas: Passenger): Promise<number> {
  let pick = 0;
  let cost = Number.MAX_VALUE;

  while (true) {
    // Find the elevator with lowest cost
    for (const elevator of elevatorGroup) {
      const tempEl = new VirtualElevator(elevator);
      const entryCall = pas.getEntryCall();
      // iterate through the heap to check how long would it take to get to the passenger
      tempEl.sequence.push(entryCall);
      while (tempEl.sequence.peek().getID() != entryCall.getID() && tempEl.currentFloor != entryCall.getFloor()) {
        tempEl.performJob();
      }

      if (tempEl.sequence.peek().getID() == entryCall.getID()) {
        tempEl.performJob();
      }

      const elevatorCost = tempEl.cost;

      if (elevatorCost < cost && elevator.sequence.size() / elevator.getConfig().capacity < 0.8) {
        cost = elevatorCost;
        pick = elevator.getID();
      }
    }

    // Check if thresholds is not reached
    if (cost == Number.MAX_VALUE) {
      await sleep(500);
    } else {
      break;
    }
  }

  return pick;
}
