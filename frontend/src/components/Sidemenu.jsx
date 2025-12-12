import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import HandymanIcon from '@mui/icons-material/Handyman';
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PaidIcon from "@mui/icons-material/Paid";
import BuildIcon from '@mui/icons-material/Build';
import AnalyticsIcon from "@mui/icons-material/Analytics";
import HailIcon from "@mui/icons-material/Hail";
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const employeeAllowed = ["/home", "/loans", "/reports"]; // rutas visibles para EMPLOYEE

export default function Sidemenu({ open, toggleDrawer, userRole }) {
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.getElementById("root");
    if (root) root.inert = open;
  }, [open]);

  // decide si un item se muestra
  const canShow = (path) => {
    if (userRole === "ADMIN") return true;
    return employeeAllowed.includes(path);
  };

  const listOptions = () => (
    <Box role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {canShow("/home") && (
          <>
            <ListItemButton onClick={() => navigate("/home")}>
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
            <Divider />
          </>
        )}

        {canShow("/customers") && (
          <ListItemButton onClick={() => navigate("/customers")}>
            <ListItemIcon><PeopleAltIcon /></ListItemIcon>
            <ListItemText primary="Clientes" />
          </ListItemButton>
        )}

        {canShow("/tools") && (
          <ListItemButton onClick={() => navigate("/tools")}>
            <ListItemIcon><HandymanIcon /></ListItemIcon>
            <ListItemText primary="Herramientas" />
          </ListItemButton>
        )}

        {canShow("/tools/units") && (
          <ListItemButton onClick={() => navigate("/tools/units")}>
            <ListItemIcon><BuildIcon /></ListItemIcon>
            <ListItemText primary="Tool Unit" />
          </ListItemButton>
        )}

        {canShow("/loans") && (
          <ListItemButton onClick={() => navigate("/loans")}>
            <ListItemIcon><CreditScoreIcon /></ListItemIcon>
            <ListItemText primary="Préstamos" />
          </ListItemButton>
        )}

        {canShow("/tariff") && (
          <ListItemButton onClick={() => navigate("/tariff")}>
            <ListItemIcon><PaidIcon /></ListItemIcon>
            <ListItemText primary="Tarifas" />
          </ListItemButton>
        )}

        {canShow("/reports") && (
          <ListItemButton onClick={() => navigate("/reports")}>
            <ListItemIcon><ReceiptLongIcon /></ListItemIcon>
            <ListItemText primary="Reportes" />
          </ListItemButton>
        )}

        {canShow("/kardex") && (
          <ListItemButton onClick={() => navigate("/kardex")}>
            <ListItemIcon><AnalyticsIcon /></ListItemIcon>
            <ListItemText primary="Kárdex" />
          </ListItemButton>
        )}
      </List>
    </Box>
  );

  return (
    <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
      {listOptions()}
    </Drawer>
  );
}