import { Building } from "@";
import type { ElevatorConfigI } from "@/utils";
import type { SettingsI } from "~/store";

const building = new Building();

function setUpBuilding({ floors, elevators, capacity, speed, strategy }: SettingsI) {
  const config: ElevatorConfigI = {
    passengerLoadingTime: 300, // Always 1 second
    passengerUnloadingTime: 300, // Always 1 second
    velocity: 1 / speed, // Always 1 meter per second
    capacity: capacity, // The capacity if always 1/4 of the entire building population
    interFloorHeight: 3, // Always 3 meters
  };

  building.setAlgorithm(strategy); // Sets algorithm in Building class
  building.setFloors(floors);
  building.setElevators(elevators, config);
}

onmessage = m => {
  console.log(m.data);
  if (m.data.type == "es-generate-person") building?.generatePassenger(m.data.from, m.data.to);
  else if (m.data.type == "es-update-settings") setUpBuilding(m.data);
};
