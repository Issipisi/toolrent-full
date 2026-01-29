import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Drawer, List, Divider, ListItemButton,
  ListItemIcon, ListItemText, Typography, Avatar,
  Chip
} from "@mui/material";
import HandymanIcon from '@mui/icons-material/Handyman';
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PaidIcon from "@mui/icons-material/Paid";
import BuildIcon from '@mui/icons-material/Build';
import AnalyticsIcon from "@mui/icons-material/Analytics";
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HomeIcon from "@mui/icons-material/Home";
import HailIcon from "@mui/icons-material/Hail";
import { useEffect } from "react";

const employeeAllowed = ["/home", "/loans", "/reports"]; // rutas visibles para EMPLOYEE

export default function Sidemenu({ open, toggleDrawer, userRole }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const root = document.getElementById("root");
    if (root) root.inert = open;
  }, [open]);

  // decide si un item se muestra (MANTIENE tu lógica original)
  const canShow = (path) => {
    if (userRole === "ADMIN") return true;
    return employeeAllowed.includes(path);
  };

  // Define los items del menú
  const menuItems = [
    {
      text: "Home",
      icon: <HomeIcon />,
      path: "/home",
    },
    {
      text: "Customers",
      icon: <PeopleAltIcon />,
      path: "/customers",
    },
    {
      text: "Tool Group",
      icon: <HandymanIcon />,
      path: "/tools",
    },
    {
      text: "Tool Unit",
      icon: <BuildIcon />,
      path: "/tools/units",
    },
    {
      text: "Loans",
      icon: <CreditScoreIcon />,
      path: "/loans",
    },
    {
      text: "Tariffs",
      icon: <PaidIcon />,
      path: "/tariff",
    },
    {
      text: "Reports",
      icon: <ReceiptLongIcon />,
      path: "/reports",
    },
    {
      text: "Kárdex",
      icon: <AnalyticsIcon />,
      path: "/kardex",
    }
  ];

  const getItemColor = (path) => {
    return location.pathname === path ? "#6c63ff" : "inherit";
  };

  const getItemBackground = (path) => {
    return location.pathname === path ? "#f0f4ff" : "transparent";
  };

  const listOptions = () => (
    <Box 
      role="presentation" 
      sx={{ 
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)'
      }}
    >
      {/* ---------- Encabezado del menú (NUEVO diseño) ---------- */}
      <Box sx={{ 
        p: 3, 
        background: "linear-gradient(135deg, #6c63ff 0%, #9d4edd 100%)",
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)',
            width: 48,
            height: 48
          }}>
            <HandymanIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              ToolRent
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Sistema de Gestión
            </Typography>
          </Box>
        </Box>
        
        <Chip
          label={`Rol: ${userRole || 'No asignado'}`}
          size="small"
          sx={{ 
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        />
      </Box>

      <Divider />

      {/* ---------- Contenido principal ---------- */}
      <Box sx={{ 
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <List sx={{ p: 2, flex: 1 }}>
          {menuItems.map((item) => {
            // MANTIENE tu lógica original de permisos
            if (!canShow(item.path)) return null;

            return (
              <ListItemButton
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  toggleDrawer(false);
                }}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  backgroundColor: getItemBackground(item.path),
                  color: getItemColor(item.path),
                  '&:hover': {
                    backgroundColor: '#f0f4ff',
                    '& .MuiListItemIcon-root': {
                      color: "#6c63ff"
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ color: getItemColor(item.path), minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal' 
                  }}
                />
                {location.pathname === item.path && (
                  <Box sx={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    backgroundColor: "#6c63ff",
                    ml: 1
                  }} />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* ---------- Pie del menú (NUEVO) ---------- */}
      <Box sx={{ 
        p: 2,
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
        flexShrink: 0
      }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          v1.0.0
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          © {new Date().getFullYear()} ToolRent
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer 
      anchor="left" 
      open={open} 
      onClose={toggleDrawer(false)}
      PaperProps={{
        sx: {
          borderRight: '1px solid #e0e0e0',
          boxShadow: '4px 0 20px rgba(0,0,0,0.05)',
          height: '100vh'
        }
      }}
    >
      {listOptions()}
    </Drawer>
  );
}