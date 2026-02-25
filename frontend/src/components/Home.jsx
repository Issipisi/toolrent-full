import { Box, Typography, Paper, Grid, Card, CardContent, Button, Stack, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import BuildIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";
import loanService from "../services/loan.service";
import toolGroupService from "../services/toolGroup.service";
import dayjs from "dayjs";
import AddIcon from '@mui/icons-material/Add';

// NUEVOS IMPORTS PARA HEURÍSTICA 10 - Ayuda y Documentación
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Home = () => {
  const { keycloak } = useKeycloak();
  const userRoles = keycloak.tokenParsed?.realm_access?.roles || [];
  const isAdmin = userRoles.includes("ADMIN");
  const isEmployee = userRoles.includes("EMPLOYEE");
  
  // NUEVO ESTADO para controlar el diálogo de ayuda
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  
  const [dashboardStats, setDashboardStats] = useState({
    activeLoans: 0,
    overdueLoans: 0,
    totalDebts: 0,
    availableTools: 0,
    loading: true
  });

  // Cargar estadísticas del dashboard
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const [loansRes, debtsRes, toolsRes] = await Promise.all([
          loanService.getActive().catch(() => ({ data: [] })),
          loanService.getPendingPayment().catch(() => ({ data: [] })),
          toolGroupService.getAvailable().catch(() => ({ data: [] }))
        ]);

        const activeLoans = loansRes.data?.length || 0;
        const overdueLoans = loansRes.data?.filter(l => 
          l.dueDate && dayjs(l.dueDate).isBefore(dayjs())
        ).length || 0;
        
        const totalDebts = debtsRes.data?.reduce((sum, d) => 
          sum + (d.fineAmount || 0) + (d.damageCharge || 0), 0
        ) || 0;
        
        // Calcular herramientas disponibles
        const availableTools = Array.isArray(toolsRes.data) 
        ? toolsRes.data.reduce((sum, tool) => {
            // Si tiene units, contar cuántas están en estado AVAILABLE
            if (tool.units && Array.isArray(tool.units)) {
              const availableUnits = tool.units.filter(unit => unit.status === 'AVAILABLE').length;
              return sum + availableUnits;
            }
            // Si tiene availableCount, usarlo
            return sum + (tool.availableCount || 0);
          }, 0)
        : 0;



        setDashboardStats({
          activeLoans,
          overdueLoans,
          totalDebts,
          availableTools,
          loading: false
        });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
        setDashboardStats(prev => ({ ...prev, loading: false }));
      }
    };

    loadDashboardStats();
  }, []);

  const adminFeatures = [
    {
      title: "Gestión de Inventario",
      description: "Control completo de herramientas disponibles, estados y stock.",
      icon: <BuildIcon fontSize="large" />,
      path: "/tools",
      color: "#6c63ff",
      roles: ["ADMIN"]
    },
    {
      title: "Gestión de Clientes",
      description: "Administra información de clientes y restricciones por deudas.",
      icon: <PeopleIcon fontSize="large" />,
      path: "/customers",
      color: "#4caf50",
      roles: ["ADMIN"]
    },
    {
      title: "Configuración de Tarifas",
      description: "Define tarifas de alquiler, multas y valores de reposición.",
      icon: <AttachMoneyIcon fontSize="large" />,
      path: "/tariff",
      color: "#ff9800",
      roles: ["ADMIN"]
    },
    {
      title: "Kardex y Movimientos",
      description: "Registro histórico completo de todas las transacciones.",
      icon: <AnalyticsIcon fontSize="large" />,
      path: "/kardex",
      color: "#9c27b0",
      roles: ["ADMIN"]
    },
  ];

  const commonFeatures = [
    {
      title: "Préstamos y Devoluciones",
      description: "Automatiza el ciclo completo de préstamos con cálculo de multas.",
      icon: <CreditScoreIcon fontSize="large" />,
      path: "/loans",
      color: "#2196f3",
      roles: ["ADMIN", "EMPLOYEE"]
    },
    {
      title: "Reportes y Estadísticas",
      description: "Genera reportes de préstamos, clientes y herramientas más solicitadas.",
      icon: <ReceiptLongIcon fontSize="large" />,
      path: "/reports",
      color: "#f44336",
      roles: ["ADMIN", "EMPLOYEE"]
    }
  ];

  const allFeatures = [...commonFeatures, ...adminFeatures];
  const availableFeatures = allFeatures.filter(feature => 
    feature.roles.some(role => userRoles.includes(role))
  );

  return (
    <Paper sx={{ p: 4, background: "#ffffff", minHeight: '80vh' }}>
      {/* Encabezado */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ 
          color: "#6c63ff", 
          mb: 2,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <HomeIcon fontSize="large" />
          ToolRent - Sistema de Gestión
        </Typography>
        
        <Typography variant="h6" sx={{ color: "#666", mb: 3, maxWidth: '800px', mx: 'auto' }}>
          Bienvenido al sistema de gestión de alquiler de herramientas. 
          {isAdmin && " Como administrador, tienes acceso completo a todas las funcionalidades."}
          {isEmployee && " Como empleado, puedes gestionar préstamos y ver reportes."}
        </Typography>
      </Box>

      {/* Estadísticas del Dashboard - MEJOR CENTRADAS */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ 
          color: "#6c63ff", 
          mb: 3, 
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          📊 Resumen General
        </Typography>
        
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', boxShadow: 2 }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="h3" color="#6c63ff" sx={{ mb: 1 }}>
                  {dashboardStats.loading ? "..." : dashboardStats.activeLoans}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Préstamos Activos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', boxShadow: 2 }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="h3" color="#f44336" sx={{ mb: 1 }}>
                  {dashboardStats.loading ? "..." : dashboardStats.overdueLoans}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vencidos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', boxShadow: 2 }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="h3" color="#ff9800" sx={{ mb: 1 }}>
                  {dashboardStats.loading ? "..." : `$${dashboardStats.totalDebts.toLocaleString()}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Deuda Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', boxShadow: 2 }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="h3" color="#4caf50" sx={{ mb: 1 }}>
                  {dashboardStats.loading ? "..." : dashboardStats.availableTools}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Herramientas Disponibles
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Botones de acción principales */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
          {isEmployee || isAdmin ? (
            <Button 
              variant="contained" 
              size="large"
              component={Link}
              to="/loans"
              sx={{ 
                background: "linear-gradient(135deg, #6c63ff 0%, #9d4edd 100%)",
                px: 5,
                py: 1.5,
                fontWeight: 'bold',
                borderRadius: 2
              }}
            >
              <AddIcon sx={{ mr: 1 }} />
              Comenzar Préstamo
            </Button>
          ) : null}
          
          {isAdmin && (
            <Button 
              variant="outlined" 
              size="large"
              component={Link}
              to="/tools"
              sx={{ 
                borderColor: "#6c63ff",
                color: "#6c63ff",
                px: 5,
                py: 1.5,
                fontWeight: 'bold',
                borderRadius: 2
              }}
            >
              <BuildIcon sx={{ mr: 1 }} />
              Ver Inventario
            </Button>
          )}
        </Stack>
        
        <Typography variant="body1" sx={{ 
          color: "#555", 
          maxWidth: '900px', 
          mx: 'auto',
          textAlign: 'center',
          lineHeight: 1.6
        }}>
          ToolRent es un sistema web que automatiza el alquiler de herramientas, reemplazando los registros manuales 
          por un control digital en tiempo real.
        </Typography>
      </Box>

      {/* Funcionalidades disponibles según rol - MEJOR DISTRIBUIDAS */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ 
          color: "#6c63ff", 
          mb: 4, 
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }}>
          <InventoryIcon /> Funcionalidades Disponibles
        </Typography>
        
        <Grid container spacing={3} justifyContent="center">
          {availableFeatures.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex' }}>
              <Card 
                sx={{ 
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ 
                  flexGrow: 1, 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ 
                    backgroundColor: `${feature.color}15`,
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}>
                    <Box sx={{ color: feature.color, fontSize: 32 }}>
                      {feature.icon}
                    </Box>
                  </Box>
                  
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {feature.description}
                    </Typography>
                  </Box>
                  
                  <Button 
                    component={Link} 
                    to={feature.path}
                    variant="outlined"
                    size="small"
                    sx={{ 
                      borderColor: feature.color,
                      color: feature.color,
                      '&:hover': {
                        backgroundColor: `${feature.color}15`,
                        borderColor: feature.color
                      }
                    }}
                  >
                    Acceder
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* ================================================================== */}
      {/* NUEVA SECCIÓN: Centro de Ayuda - Heurística 10 de Nielsen */}
      {/* ================================================================== */}
      <Box sx={{ mb: 6, mt: 4 }}>
        <Typography variant="h4" sx={{ 
          color: "#6c63ff", 
          mb: 4, 
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }}>
          <HelpOutlineIcon /> Centro de Ayuda
        </Typography>
        
        <Grid container spacing={3} justifyContent="center">
          {/* Tarjeta de Guía Rápida */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              }
            }} onClick={() => setHelpDialogOpen(true)}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Box sx={{ 
                  backgroundColor: '#e3f2fd',
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <MenuBookIcon sx={{ color: '#2196f3', fontSize: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Guía Rápida
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aprende los conceptos básicos del sistema
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Tarjeta de Soporte */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              }
            }} onClick={() => window.open('mailto:soporte@toolrent.com', '_blank')}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Box sx={{ 
                  backgroundColor: '#f3e5f5',
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <SupportAgentIcon sx={{ color: '#9c27b0', fontSize: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Contactar Soporte
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ¿Problemas técnicos? Escríbenos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Tarjeta de FAQ */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              }
            }} onClick={() => setHelpDialogOpen(true)}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Box sx={{ 
                  backgroundColor: '#fff3e0',
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <ContactSupportIcon sx={{ color: '#ff9800', fontSize: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Preguntas Frecuentes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Respuestas a las dudas más comunes
                </Typography>
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Box>

      {/* ================================================================== */}
      {/* NUEVO DIÁLOGO MODAL: Documentación Detallada */}
      {/* ================================================================== */}
      <Dialog 
        open={helpDialogOpen} 
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: '#6c63ff', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <HelpOutlineIcon />
          Centro de Ayuda - ToolRent
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#6c63ff' }}>
            📚 Guía de Inicio Rápido
          </Typography>
          
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">
                ¿Cómo crear un nuevo préstamo?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                1. Haz clic en "Comenzar Préstamo" desde la página de inicio<br/>
                2. Selecciona el cliente de la lista o registra uno nuevo<br/>
                3. Agrega las herramientas disponibles al carrito<br/>
                4. Define la fecha de devolución estimada<br/>
                5. Confirma el préstamo y entrega las herramientas
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">
                ¿Cómo gestionar devoluciones?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                1. Ve a la sección "Préstamos y Devoluciones"<br/>
                2. Busca el préstamo activo por cliente o ID<br/>
                3. Revisa el estado de cada herramienta<br/>
                4. Registra daños si los hay (se calcula multa automáticamente)<br/>
                5. Confirma la devolución y libera la garantía
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">
                ¿Cómo funciona el sistema de multas?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                • <strong>Retraso:</strong> Se calcula automáticamente según días de atraso y tarifa diaria<br/>
                • <strong>Daños:</strong> Se evalúa el estado y se aplica % del valor de reposición<br/>
                • <strong>Pérdida total:</strong> Se cobra el 100% del valor de reposición<br/>
                • Las deudas se pueden pagar desde "Préstamos y Devoluciones"
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" sx={{ mb: 2, color: '#6c63ff' }}>
            📞 Contacto de Soporte
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            ¿Necesitas ayuda adicional? Contáctanos:
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemIcon>
                <SupportAgentIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Email" 
                secondary="soporte@toolrent.com" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SupportAgentIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Teléfono" 
                secondary="+56 2 2123 4567 (Lunes a Viernes 9:00 - 18:00)" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SupportAgentIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Tiempo de respuesta" 
                secondary="24-48 horas hábiles" 
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)} color="primary" variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Pie de página */}
      <Divider sx={{ my: 4 }} />
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          ToolRent v1.0.0 | Sistema de Gestión de Alquiler de Herramientas
        </Typography>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} - Desarrollado para optimizar la gestión de alquiler de herramientas
        </Typography>
      </Box>
    </Paper>
  );
};

export default Home;