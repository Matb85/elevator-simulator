import { useState } from "react";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import AppBar from "@mui/material/AppBar";
import { Box, Checkbox, FormControlLabel, IconButton, TextField, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import InputNumber from "./InputNumber";

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

  const [value, setValue] = useState<number | null>(null);

  const drawer = (
    <>
      <Toolbar />
      <Divider />
      <List>
        <ListItem>
          <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Typography>Add a Person</Typography>

            <InputNumber
              placeholder="From Floor"
              aria-label="From Floor"
              value={value}
              onChange={(event, val) => setValue(val)}
            />
            <InputNumber
              placeholder="To Floor"
              aria-label="To Floor"
              value={value}
              onChange={(event, val) => setValue(val)}
            />

            <Button variant="contained">Add a person</Button>

            <FormControlLabel control={<Checkbox defaultChecked />} label="Generate people automativally" />
          </Box>
        </ListItem>
        <Divider />
        <ListItem>
          <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Typography>Simulation controls</Typography>
            <Box component="section" sx={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <Button variant="contained">Start</Button>
              <Button variant="contained" color="error">
                Stop
              </Button>
              <Button variant="contained" color="secondary">
                Reset
              </Button>
            </Box>
          </Box>
        </ListItem>
        <Divider />
        <ListItem>
          <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Typography>Settings</Typography>

            <InputNumber
              placeholder="Number of floors"
              aria-label="Number of floors"
              value={value}
              onChange={(event, val) => setValue(val)}
            />
            <InputNumber
              placeholder="Number of elevators"
              aria-label="Number of elevators"
              value={value}
              onChange={(event, val) => setValue(val)}
            />
            <InputNumber
              placeholder="Elevator speed"
              aria-label="Elevator speed"
              value={value}
              onChange={(event, val) => setValue(val)}
            />
            <InputNumber
              placeholder="Elevator capacity"
              aria-label="Elevator capacity"
              value={value}
              onChange={(event, val) => setValue(val)}
            />
            <Button variant="contained">Update</Button>

            <FormControlLabel control={<Checkbox defaultChecked />} label="Generate people automativally" />
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
