import { Box } from "@mui/material";

import "./Drawing.css";

import Worker from "./worker.ts?worker";
import {
  setGeneratePerson,
  setSettings,
  setStatus,
  useGeneratePerson,
  useSettings,
  useStatus,
  type SettingsI,
} from "./store";
import { useEffect } from "react";

const worker = new Worker();

function startWorker(settings: SettingsI) {
  console.log("new worker settings", settings);

  worker.postMessage({ ...settings, type: "es-update-settings" });

  worker.onmessage = m => {
    //console.log(m.data, m.data.floors);
    const el = document.getElementById("elevator-" + m.data.ID) as HTMLElement;
    el.style.setProperty("--current-floor", m.data.currentFloor + "");
    el.innerText = m.data.currentPassengers;
    for (let i = 0; i < settings.floors; i++) {
      let el2 = document.getElementById("waiting-" + i) as HTMLElement;
      el2.innerText = m.data.peopleWaiting[i];
      el2 = document.getElementById("expected-" + i) as HTMLElement;
      el2.innerText = m.data.peopleExpected[i];
    }
  };
}

export default function Drawing(props: any) {
  const settings = useSettings();
  const person = useGeneratePerson();

  const status = useStatus();

  useEffect(() => {
    if (!person.ready) return;
    worker.postMessage({ ...person, type: "es-generate-person" });
    setGeneratePerson({ ...person, ready: false });
  }, [person]);

  useEffect(() => {
    if (!settings.ready) return;
    setSettings({ ...settings, ready: false });
    startWorker(settings);
  }, [settings]);

  useEffect(() => {
    if (status.running) startWorker(settings);
    else startWorker({ ...settings, elevators: 0 });
  }, [status]);

  return (
    <>
      <Box sx={{ p: `1rem` }}>
        <table className="building">
          <tbody>
            <tr>
              <th style={{ height: "2rem" }}>Floor number</th>
              <th style={{ height: "2rem" }}>people waiting</th>
              {Array.from(Array(settings.elevators).keys()).map(i => (
                <th key={i} style={{ position: "relative", width: "1.5rem", height: "2rem" }}>
                  {i}
                  <div
                    className="elevator"
                    style={
                      {
                        transform: `translateY(calc((${settings.floors} - var(--current-floor)) * 2rem))`,
                        "--current-floor": `0`,
                      } as React.CSSProperties
                    }
                    id={"elevator-" + i}
                  >
                    0
                  </div>
                </th>
              ))}
              <th style={{ height: "2rem" }}>people expected</th>
            </tr>
            {Array.from(Array(settings.floors).keys()).map(i => (
              <tr key={i}>
                <td>{settings.floors - i - 1}</td>
                <td id={"waiting-" + (settings.floors - i - 1)}>0</td>
                {Array.from(Array(settings.elevators).keys()).map(i => (
                  <td key={i} style={{ width: "1.5rem", height: "2rem", backgroundColor: "lightgray" }}></td>
                ))}
                <td id={"expected-" + (settings.floors - i - 1)}> 0</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </>
  );
}
