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
import { Avatar, Chip, Tooltip } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";

export default function Navbar({ userRole }) {
  const [open, setOpen] = useState(false);
  const { keycloak, initialized } = useKeycloak();
  const navigate = useNavigate();

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(open);
  };

  // Obtener información del usuario
  const getUserName = () => {
    return keycloak.tokenParsed?.preferred_username ||
           keycloak.tokenParsed?.email ||
           "Usuario";
  };

  const getUserInitials = () => {
    const name = getUserName();
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const getRoleColor = () => {
    return userRole === 'ADMIN' ? 'error' : 
           userRole === 'EMPLOYEE' ? 'success' : 'default';
  };

  const getRoleLabel = () => {
    return userRole === 'ADMIN' ? 'Administrador' : 
           userRole === 'EMPLOYEE' ? 'Empleado' : 'Sin rol';
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="static" 
        sx={{ 
          background: "linear-gradient(135deg, #6c63ff 0%, #9d4edd 100%)",
          boxShadow: '0 4px 12px rgba(108, 99, 255, 0.25)'
        }}
      >
        <Toolbar sx={{ minHeight: '64px' }}>
          {/* Botón del menú - Solo visible si está autenticado */}
          {keycloak.authenticated && (
            <Tooltip title="Abrir menú">
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ 
                  mr: 2,
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.15)'
                  }
                }}
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Título principal */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              flexGrow: 1,
              cursor: 'pointer'
            }}
            onClick={() => navigate("/home")}
          >
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                transition: 'opacity 0.2s ease',
                '&:hover': {
                  opacity: 0.9
                }
              }}
            >
              ToolRent
            </Typography>
            
            <Typography 
              variant="subtitle2" 
              sx={{ 
                opacity: 0.9,
                fontSize: '0.8rem',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Sistema de Gestión
            </Typography>
          </Box>

          {/* Información del usuario */}
          {initialized && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2 
            }}>
              {keycloak.authenticated ? (
                <>
                  {/* Info de usuario y rol */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    mr: 1
                  }}>
                    {/* Rol del usuario */}
                    {userRole && (
                      <Tooltip title={getRoleLabel()}>
                        <Chip
                          label={userRole}
                          size="small"
                          color={getRoleColor()}
                          sx={{ 
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            height: 24,
                            '& .MuiChip-label': {
                              px: 1
                            }
                          }}
                        />
                      </Tooltip>
                    )}

                    {/* Avatar del usuario */}
                    <Tooltip title={getUserName()}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          fontWeight: 'bold',
                          border: '2px solid rgba(255,255,255,0.3)',
                          fontSize: '0.9rem'
                        }}
                      >
                        {getUserInitials()}
                      </Avatar>
                    </Tooltip>

                    {/* Nombre de usuario (solo en desktop) */}
                    <Typography 
                      sx={{ 
                        display: { xs: 'none', md: 'block' },
                        fontSize: '0.9rem',
                        fontWeight: 'medium',
                        maxWidth: '120px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {getUserName()}
                    </Typography>
                  </Box>

                  {/* Botón de logout */}
                  <Tooltip title="Cerrar sesión">
                    <Button
                      color="inherit"
                      startIcon={<LogoutIcon />}
                      onClick={() => keycloak.logout()}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 'medium',
                        fontSize: '0.85rem',
                        minWidth: 'auto',
                        padding: '6px 12px',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      <span style={{ display: { xs: 'none', sm: 'inline' } }}>
                        Salir
                      </span>
                    </Button>
                  </Tooltip>
                </>
              ) : (
                /* Botón de login si no está autenticado */
                <Button
                  color="inherit"
                  startIcon={<LoginIcon />}
                  onClick={() => keycloak.login()}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'medium',
                    fontSize: '0.9rem',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Iniciar Sesión
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Sidemenu */}
      <Sidemenu open={open} toggleDrawer={toggleDrawer} userRole={userRole} />
    </Box>
  );
}