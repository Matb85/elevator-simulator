import type { Elevator } from "../models/Elevator";

export class ThreePassage {
  /**
   * Three Passage Group Elevator Scheduling.
   *
   * Estimates the costs that would result from assigning the new call to the elevator.
   *
   * Stop costs are static and include the period of time necessary for opening the door,
   * unloading and loading each one passenger and closing the door.
   *
   * In case every elevator already reached 80% load (number of calls > 80% elevator capacity),
   * calls will not get assigned until at least one elevator falls below this mark.
   *
   * The call is assigned to the elevator with the lowest costs.
   */
  public choseElevator(elevatorGroup: Elevator[]): number {
    let pick = 0;
    let flag = true;
    let cost = Number.MAX_VALUE;

    while (flag) {
      // Find the elevator with lowest cost
      for (const elevator of elevatorGroup) {
        const calls = elevator.sequence.size(); // Current number of calls in sequence
        const elevatorCost =
          (calls + 1) *
          (elevator.velocity * elevator.interFloorHeight +
            elevator.passengerLoadingTime +
            elevator.passengerUnloadingTime); // Total cost of all calls plus new call

        if (elevatorCost < cost) {
          cost = elevatorCost;
          pick = elevator.ID;
        }
      }

      // Check if thresholds is not reached
      if (elevatorGroup[pick].sequence.size() / elevatorGroup[pick].capacity < 0.8) {
        flag = false;
      }
    }

    return pick;
  }
}
