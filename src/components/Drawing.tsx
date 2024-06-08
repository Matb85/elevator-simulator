import { Box, IconButton, Typography } from "@mui/material";
import "./Drawing.css";

export default function Drawing(props: any) {
  const elevators = 3;
  const floors = 14;
  // Start the GroupElevatorController thread
  // new Thread(building.getController()).start(); // Activates the GroupElevatorController to scan the floors array

  // Keep generating passengers on different floors of the building

  return (
    <>
      <Box sx={{ p: `1rem` }}>
        <table className="building">
          <tbody>
            <tr>
              <th style={{ height: "2rem" }}>Floor</th>
              <th style={{ height: "2rem" }}>people waiting</th>
              {Array.from(Array(elevators).keys()).map(i => (
                <th key={i} style={{ position: "relative", width: "1.5rem", height: "2rem" }}>
                  {i}
                  <div
                    className="elevator"
                    style={
                      {
                        transform: `translateY(calc((${floors} - var(--current-floor)) * 2rem))`,
                        "--current-floor": `0`,
                      } as React.CSSProperties
                    }
                    id={"elevator-" + i}
                  ></div>
                </th>
              ))}
            </tr>
            {Array.from(Array(floors).keys()).map(i => (
              <tr key={i}>
                <td>{floors - i - 1}</td>
                <td>{0}</td>
                {Array.from(Array(elevators).keys()).map(i => (
                  <td key={i} style={{ width: "1.5rem", height: "2rem", backgroundColor: "lightgray" }}></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </>
  );
}
