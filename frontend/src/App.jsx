import './App.css'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material';
import { NotificationProvider } from './components/NotificationProvider';
import Navbar from "./components/Navbar"
import Home from './components/Home';
import ToolUnitView from './components/ToolUnitView';
import ToolGroupView from './components/ToolGroupView';
import NotFound from './components/NotFound';
import CustomerView from "./components/CustomerView";
import LoanView from "./components/LoanView";
import TariffView from "./components/TariffView";
import KardexView from "./components/KardexView";
import ReportView from "./components/ReportView";
import AccessDenied from "./components/AccessDenied";
import { useKeycloak } from "@react-keycloak/web";

function App() {
  const { keycloak, initialized } = useKeycloak();

  // Mostrar loading mientras Keycloak se inicializa
  if (!initialized) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress aria-label="Cargando autenticación" />
        <Typography>Cargando autenticación...</Typography>
      </Box>
    );
  }

  // Si no está autenticado, Keycloak se encargará
  if (!keycloak.authenticated && initialized) {
    keycloak.login();
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress aria-label="Redirigiendo al login" />
        <Typography>Redirigiendo al login...</Typography>
      </Box>
    );
  }

  // ---- rol del usuario ----
  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const userRole = roles.includes("ADMIN") ? "ADMIN" : roles.includes("EMPLOYEE") ? "EMPLOYEE" : null;

  // Componente para proteger rutas usando AccessDenied
  const PrivateRoute = ({ element, rolesAllowed }) => {
    if (!rolesAllowed.some(r => roles.includes(r))) {
      return <AccessDenied userRole={userRole} requiredRoles={rolesAllowed} />;
    }
    return element;
  };

  return (
    <NotificationProvider>
      <Router>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}>
          <Navbar userRole={userRole} />
          <Box 
            component="main"
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              pt: 3,
              px: { xs: 2, sm: 3, md: 4 },
              pb: 3
            }}
            aria-label="Contenido principal"
          >
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />

              {/* Solo ADMIN puede ver clientes */}
              <Route
                path="/customers/*"
                element={<PrivateRoute element={<CustomerView />} rolesAllowed={["ADMIN"]}/>}
              />

              <Route
                path="/tools"
                element={<PrivateRoute element={<ToolGroupView />} rolesAllowed={["ADMIN"]} />}
              />

              <Route 
                path="/tools/units" 
                element={<PrivateRoute element={<ToolUnitView />} rolesAllowed={["ADMIN"]} />} 
              />

              <Route 
                path="/loans" 
                element={<PrivateRoute element={<LoanView />} rolesAllowed={["ADMIN","EMPLOYEE"]} />} 
              />

              <Route 
                path="/tariff" 
                element={<PrivateRoute element={<TariffView />} rolesAllowed={["ADMIN"]} />} 
              />

              <Route
                path="/kardex"
                element={<PrivateRoute element={<KardexView />} rolesAllowed={["ADMIN"]} />}
              />

              <Route
                path="/reports"
                element={<PrivateRoute element={<ReportView />} rolesAllowed={["ADMIN","EMPLOYEE"]} />}
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </NotificationProvider>
  );
}

export default App;
