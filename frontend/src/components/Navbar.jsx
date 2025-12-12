import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Sidemenu from "./Sidemenu";
import { useState } from "react";
import { useKeycloak } from "@react-keycloak/web";

export default function Navbar({ userRole }) {
  const [open, setOpen] = useState(false);
  const { keycloak, initialized } = useKeycloak();

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(open);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ToolRent: Sistema de Gestión de Herramientas
          </Typography>

          {initialized && (
            <>
              {keycloak.authenticated ? (
                <>
                  <Typography sx={{ mr: 2 }}>
                    {keycloak.tokenParsed?.preferred_username ||
                      keycloak.tokenParsed?.email}
                  </Typography>
                  <Button color="inherit" onClick={() => keycloak.logout()}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button color="inherit" onClick={() => keycloak.login()}>
                  Login
                </Button>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Pasamos el rol al menú lateral */}
      <Sidemenu open={open} toggleDrawer={toggleDrawer} userRole={userRole} />
    </Box>
  );
}