import { Building } from "./models/Building";
import { sleep } from "./utils";

const floors = 20;
const elevators = 3;
const population = 300;

const building = new Building(floors, elevators, population);

// Chose algorithm
console.log("\nChoose algorithm:\n");
console.log("\t1 - Round-Robin");
console.log("\t2 - Up-Peak");
console.log("\t3 - Zoning");
console.log("\t4 - Three Passage");

building.setAlgorithm(2); // Sets algorithm in Building class

console.log("\nAll elevators start on the central floor of the building with direction up.\n");

// Create N number of Floor objects
building.createFloors();

// Create L number of Elevator objects
building.createElevators();

// Start the GroupElevatorController thread
// new Thread(building.getController()).start(); // Activates the GroupElevatorController to scan the floors array

// Keep generating passengers on different floors of the building
while (true) {
  // Generate a passenger on one of the floors
  building.generatePassenger(Math.round(Math.random() * building.getN()), Math.round(Math.random() * building.getN()));
  await sleep(20000);
}
