import { Elevator } from "./Elevator";
import { Passenger } from "./Passenger";
import { RoundRobin } from "../controllers/RoundRobin";
import { ThreePassage } from "../controllers/ThreePassage";
import { Zoning } from "../controllers/Zoning";
import { CallType, Dir, Strategies, sleep, type ElevatorConfigI } from "../utils";
import { Call } from "./Call";
import { DEBUG } from "../settings";
import { FloorTracker } from "../FloorTracker";

export class Building {
  private N: number = 0; // Number of floors
  private L: number = 0; // Number of elevators
  private U: number = 0; // Building population
  private algorithm: Strategies; // Desired algorithm will be passed as a CL arg

  private elevatorGroup: Elevator[] = []; // An array of L elevators
  private floors: FloorTracker; // An array of N floors

  private roundRobin: RoundRobin;
  private zoning: Zoning;
  private threePassage: ThreePassage;

  constructor() {
    this.roundRobin = new RoundRobin();
    this.zoning = new Zoning();
    this.threePassage = new ThreePassage();
  }

  public setAlgorithm(algorithm: Strategies) {
    this.algorithm = algorithm;
  }

  /**
   * Creates L Elevator objects in the elevatorGroup array.
   */
  public setElevators(L: number, config: ElevatorConfigI): void {
    for (let i = 0; i < this.elevatorGroup.length; ++i) {
      this.elevatorGroup[i].destroy();
    }

    this.elevatorGroup = [];
    this.L = L;

    for (let i = 0; i < this.L; ++i) {
      setTimeout(() => {
        const el = new Elevator(i, this.algorithm, config, this.N, this.L, this.floors);
        this.elevatorGroup.push(el);
      }, i * 50);
    }
  }

  /**
   * Creates N Floor objects in the floors array.
   */
  public setFloors(N: number): void {
    this.N = N;
    this.floors = new FloorTracker(N);
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
  public generatePassenger(entryFloor: number, exitFloor: number): void {
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

    // Each algorithm returns the index of the chosen elevator
    // The chosen elevator will be given a task (receive job)
    switch (this.algorithm) {
      case Strategies.ROUND_ROBIN:
        chosenElevator = this.roundRobin.choseElevator(this.elevatorGroup, this.L);
        break;
      case Strategies.UP_PEAK:
        chosenElevator = this.roundRobin.choseElevator(this.elevatorGroup, this.L);
        break;
      case Strategies.ZONING:
        chosenElevator = this.zoning.choseElevator(this.L, this.N, pas.getEntryCall().getFloor());
        break;
      case Strategies.THREE_PASSAGE:
        chosenElevator = this.threePassage.choseElevator(this.elevatorGroup);
        break;
    }

    this.elevatorGroup[chosenElevator].receiveJob(pas); // Assign a passenger to an elevator
  }
}
