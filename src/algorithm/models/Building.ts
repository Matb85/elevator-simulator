import { Elevator } from "./Elevator";
import { Passenger } from "./Passenger";
import { RoundRobin } from "../controllers/RoundRobin";
import { ThreePassage } from "../controllers/ThreePassage";
import { Zoning } from "../controllers/Zoning";
import { CallType, Dir, Strategies, sleep } from "../utils";
import { Call } from "./Call";
import { DEBUG } from "../settings";

export class Building {
  private N: number; // Number of floors
  private L: number; // Number of elevators
  private U: number; // Building population
  private algorithm: Strategies; // Desired algorithm will be passed as a CL arg

  private elevatorGroup: Elevator[] = []; // An array of L elevators
  private floors: number[] = []; // An array of N floors

  private roundRobin: RoundRobin;
  private zoning: Zoning;
  private threePassage: ThreePassage;

  constructor(floors: number, elevators: number, population: number) {
    this.N = floors;
    this.L = elevators;
    this.U = population;

    this.roundRobin = new RoundRobin();
    this.zoning = new Zoning();
    this.threePassage = new ThreePassage();
  }

  public getN(): number {
    return this.N;
  }

  public setAlgorithm(algorithm: Strategies) {
    this.algorithm = algorithm;
  }

  /**
   * Creates L Elevator objects in the elevatorGroup array.
   */
  public createElevators(): void {
    for (let i = 0; i < this.L; ++i) {
      setTimeout(() => {
        const el = new Elevator(
          i,
          this.algorithm,
          300,
          300,
          1,
          8,
          3,
          this.N,
          this.L,
          () => this.floors,
          (x: number) => (this.floors[x] -= 1)
        );
        this.elevatorGroup.push(el);
      }, i * 50);
    }
  }

  /**
   * Creates N Floor objects in the floors array.
   */
  public createFloors(): void {
    for (let i = 0; i < this.N; ++i) {
      this.floors.push(0);
    }
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
    this.floors[entryFloor] += 1;

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
