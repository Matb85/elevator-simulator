import { ElevatorSystem, type ElevatorConfigI, type DisplayDataI } from "@";
import type { SettingsI } from "~/store";

const building = new ElevatorSystem();

/**
 * Animates the current position of the elevator in DOM.
 */
async function animateElevator(c: DisplayDataI): Promise<void> {
  postMessage(c);
}

function setUpBuilding({ floors, elevators, capacity, speed, strategy }: SettingsI) {
  const config: ElevatorConfigI = {
    loadingTime: 300,
    unloadingTime: 300,
    velocity: 1 / speed,
    capacity: capacity,
    interFloorHeight: 3,
    animate: animateElevator,
  };

  building.setAlgorithm(strategy); // Sets algorithm in the main class
  building.setFloors(floors);
  building.setElevators(elevators, config);
}

onmessage = m => {
  console.log(m.data);
  if (m.data.type == "es-generate-person") building?.generatePassenger(m.data.from, m.data.to);
  else if (m.data.type == "es-update-settings") setUpBuilding(m.data);
};
