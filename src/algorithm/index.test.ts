import { ElevatorSystem, type ElevatorConfigI, type DisplayDataI } from "@";
import { Dir, Strategies, sleep } from "@/utils";
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";

let building: ElevatorSystem;

const N = 12;

/**
 * Displays the current position of the elevator in a graphical way.
 */
async function displayElevator(d: DisplayDataI): Promise<void> {
  console.log(`\n\nElevator ${d.ID}\n`);
  console.log("------------------------------------------\n");
  for (let i = 0; i < N; ++i) {
    if (i == d.currentFloor) {
      console.log(" == ");
    } else {
      console.log(i);
    }
  }

  if (d.direction == Dir.UP) {
    console.log("\n\n-->");
  } else {
    console.log("\n\n<--");
  }
  console.log("------------------------------------------\n\n");
}

const config: ElevatorConfigI = {
  loadingTime: 300,
  unloadingTime: 300,
  velocity: 1,
  capacity: 8,
  interFloorHeight: 3,
  animate: displayElevator,
};

describe("tests", () => {
  before(() => {
    building = new ElevatorSystem();

    building.setAlgorithm(Strategies.BEFORE_AFTERNOON); // Sets algorithm in the main class
    building.setFloors(N);
  });

  it("Simple elevator test", async () => {
    const L = 2;
    building.setElevators(L, config);

    building.generatePassenger(10, 0);

    const expectedTime =
      (config.loadingTime + config.unloadingTime) * 2 + config.velocity * config.interFloorHeight * 200 * 15;

    const buffor = 500;

    console.log(expectedTime + buffor);

    await sleep(expectedTime + buffor);
    const elevators = building.getElevators();

    elevators.forEach(el => {
      el.destroy();
    });

    assert.equal(elevators[0].getCurrentFloor(), 0);
    assert.equal(elevators[1].getCurrentFloor(), 6);

    console.log("FINISH");
    return;
  });

  after(() => {
    building.setElevators(0, config);
  });
});
