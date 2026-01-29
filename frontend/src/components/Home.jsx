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

const Home = () => {
  const { keycloak } = useKeycloak();
  const userRoles = keycloak.tokenParsed?.realm_access?.roles || [];
  const isAdmin = userRoles.includes("ADMIN");
  const isEmployee = userRoles.includes("EMPLOYEE");

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
      <Box sx={{ textAlign: 'center', mb: 6 }}>
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

        <Typography variant="body1" sx={{ 
          color: "#555", 
          mb: 4, 
          maxWidth: '900px', 
          mx: 'auto',
          textAlign: 'justify',
          lineHeight: 1.6
        }}>
          ToolRent es un sistema web que automatiza el alquiler de herramientas, reemplazando los registros manuales 
          por un control digital en tiempo real. Permite gestionar inventario, préstamos, devoluciones y multas 
          automáticamente, evitando pérdidas por herramientas extraviadas, agilizando la atención al cliente y 
          garantizando transparencia en todas las operaciones de la tienda.
        </Typography>
        
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 6 }}>
          {isEmployee || isAdmin ? (
            <Button 
              variant="contained" 
              size="large"
              component={Link}
              to="/loans"
              sx={{ 
                background: "linear-gradient(135deg, #6c63ff 0%, #9d4edd 100%)",
                px: 4
              }}
            >
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
                color: "#6c63ff"
              }}
            >
              Ver Inventario
            </Button>
          )}
        </Stack>
      </Box>

      {/* Funcionalidades disponibles según rol */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ 
          color: "#6c63ff", 
          mb: 3, 
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }}>
          <InventoryIcon /> Funcionalidades Disponibles
        </Typography>
        
        <Grid container spacing={3}>
          {availableFeatures.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
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
                  alignItems: 'center'
                }}>
                  <Box sx={{ 
                    backgroundColor: `${feature.color}15`, // 15 = 8% opacity
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}>
                    <Box sx={{ color: feature.color }}>
                      {feature.icon}
                    </Box>
                  </Box>
                  
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    {feature.description}
                  </Typography>
                  
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

      {/* Información del proyecto */}
      <Card sx={{ backgroundColor: '#f8f9ff', mb: 4 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, color: "#6c63ff", display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon /> Acerca del Proyecto
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ textAlign: 'justify', mb: 3 }}>
            Para la realización de este proyecto se utilizó{" "} 
            <a href="https://spring.io/projects/spring-boot" target="_blank" rel="noopener noreferrer" style={{ color: '#6c63ff', fontWeight: 'bold' }}>
              Spring Boot
            </a> (para el backend),{" "}
            <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#6c63ff', fontWeight: 'bold' }}>
              React
            </a> (para el Frontend) y{" "}
            <a href="https://www.mysql.com/products/community/" target="_blank" rel="noopener noreferrer" style={{ color: '#6c63ff', fontWeight: 'bold' }}>
              MySQL
            </a> (para la base de datos).
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" sx={{ mb: 2, color: "#6c63ff" }}>
            Tecnologías Utilizadas
          </Typography>
          
          <Grid container spacing={20}>
            <Grid item xs={20} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: '#333' }}>
                Backend
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2">• Spring Boot 3.x - Framework Java</Typography>
                <Typography variant="body2">• Spring Security - Autenticación y Autorización</Typography>
                <Typography variant="body2">• JPA/Hibernate - Persistencia de datos</Typography>
                <Typography variant="body2">• MySQL - Base de datos relacional</Typography>
                <Typography variant="body2">• REST API - Servicios web</Typography>
              </Stack>
            </Grid>
            
            <Grid item xs={20} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: '#333' }}>
                Frontend
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2">• React 18 - Biblioteca JavaScript</Typography>
                <Typography variant="body2">• Material-UI (MUI) - Componentes UI</Typography>
                <Typography variant="body2">• Keycloak - Gestión de identidad</Typography>
                <Typography variant="body2">• React Router - Navegación</Typography>
                <Typography variant="body2">• Axios - Cliente HTTP</Typography>
              </Stack>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#eef2ff', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Beneficios del sistema:</strong> Control en tiempo real, reducción de errores, 
              automatización de procesos, reportes automáticos y mejor experiencia de usuario.
            </Typography>
          </Box>
        </CardContent>
      </Card>

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