import { Building } from "../algorithm/models/Building";
import type { SettingsI } from "./store";

let building: Building;

function setUpBuilding({ floors, elevators, capacity, speed, strategy }: SettingsI) {
  if (building) return;
  building = new Building(floors, elevators, 80);

  building.setAlgorithm(strategy); // Sets algorithm in Building class

  building.createFloors();

  building.createElevators();
}

onmessage = m => {
  console.log(m.data);
  if (m.data.type == "es-generate-person") building?.generatePassenger(m.data.from, m.data.to);
  else if (m.data.type == "es-update-settings") setUpBuilding(m.data);
};
