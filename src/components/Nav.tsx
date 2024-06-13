import { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  Radio,
  RadioGroup,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import InputNumber from "./InputNumber";
import { setGeneratePerson, setSettings, setStatus, useGeneratePerson, useSettings, useStatus } from "./store";
import { Strategies } from "../algorithm/utils";

let interval: ReturnType<typeof setInterval>;

export default function SideBar(props: any) {
  const drawerWidth = 300;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const container = window !== undefined ? () => window.document.body : undefined;
  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const settings = useSettings();
  const person = useGeneratePerson();
  const status = useStatus();

  const [autoPeople, setAutoPeople] = useState(false);

  useEffect(() => {
    if (autoPeople) {
      interval = setInterval(() => {
        setGeneratePerson({
          from: Math.round(Math.random() * (settings.floors - 1)),
          to: Math.round(Math.random() * (settings.floors - 1)),
          ready: true,
        });
      }, 800);
    } else {
      clearInterval(interval);
    }
  }, [autoPeople]);

  const drawer = (
    <>
      <Toolbar />
      <Divider />
      <List>
        <ListItem>
          <Box component="section" gap={1} sx={{ display: "flex", flexDirection: "column" }}>
            <Typography>Simulation controls</Typography>
            <Typography variant="caption">
              Status: <b>{status.running ? "running" : "stopped"}</b>
            </Typography>
            <Box component="section" sx={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <Button disabled={status.running} variant="contained" onClick={() => setStatus({ running: true })}>
                Start
              </Button>
              <Button
                disabled={!status.running}
                variant="contained"
                color="error"
                onClick={() => setStatus({ running: false })}
              >
                Stop
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setStatus({ running: false });
                  setTimeout(() => {
                    setStatus({ running: true });
                  }, 100);
                }}
              >
                Reset
              </Button>
            </Box>
          </Box>
        </ListItem>
        <Divider />
        <ListItem>
          <Box component="section" gap={1} sx={{ display: "flex", flexDirection: "column" }}>
            <Typography>Adding people</Typography>
            <Stack direction="row" gap={1}>
              <InputNumber
                placeholder="From Floor"
                value={person.from}
                min={0}
                max={settings.floors - 1}
                onChange={(event, val) => val && val >= 0 && setGeneratePerson({ ...person, from: val })}
              />
              <InputNumber
                placeholder="To Floor"
                value={person.to}
                min={0}
                max={settings.floors - 1}
                onChange={(event, val) => val && val >= 0 && setGeneratePerson({ ...person, to: val })}
              />
            </Stack>
            <Button onClick={() => setGeneratePerson({ ...person, ready: true })} variant="contained">
              Add a person
            </Button>

            <FormControlLabel
              control={<Checkbox />}
              label="Generate people automatically every 800ms"
              value={autoPeople}
              onChange={() => setAutoPeople(!autoPeople)}
            />
          </Box>
        </ListItem>
        <Divider />
        <ListItem>
          <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Typography>Settings</Typography>

            <Button variant="contained" onClick={() => setSettings({ ...settings, ready: true })}>
              Update settings
            </Button>

            <Stack direction="row" gap={1}>
              <InputNumber
                placeholder="Number of floors"
                value={settings.floors}
                onChange={(event, val) => val && val > 0 && setSettings({ ...settings, floors: val })}
              />
              <InputNumber
                placeholder="Number of elevators"
                value={settings.elevators}
                onChange={(event, val) => val && val > 0 && setSettings({ ...settings, elevators: val })}
              />
            </Stack>
            <Stack direction="row" gap={1}>
              <InputNumber
                min={1}
                max={20}
                placeholder="Elevator speed"
                value={settings.speed}
                onChange={(event, val) => val && val > 0 && setSettings({ ...settings, speed: val })}
              />
              <InputNumber
                placeholder="Elevator capacity"
                value={settings.capacity}
                onChange={(event, val) => val && val > 0 && setSettings({ ...settings, capacity: val })}
              />
            </Stack>
            <Typography variant="caption" style={{ marginBottom: "-0.5rem" }}>
              Time of day:
            </Typography>
            <RadioGroup
              onChange={(event, val) => val && setSettings({ ...settings, strategy: parseInt(val) })}
              defaultValue={Strategies.BEFORE_AFTERNOON}
              name="radio-buttons-group"
            >
              <FormControlLabel value={Strategies.BEFORE_AFTERNOON} control={<Radio />} label="Morning - afternoon" />
              <FormControlLabel value={Strategies.AFTER_AFTERNOON} control={<Radio />} label="Afternoon - evening" />
            </RadioGroup>
          </Box>
        </ListItem>
      </List>
    </>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1201,
          width: `100%`,
          ml: 0,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Elevator simulator
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: "flex" }}>
        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="mailbox folders">
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onTransitionEnd={handleDrawerTransitionEnd}
            onClose={handleDrawerClose}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box component="main" sx={{ flexGrow: 1, width: { sm: `calc(100% - ${drawerWidth}px)` }, paddingTop: `4rem` }}>
          {props.children}
        </Box>
      </Box>
    </>
  );
}
