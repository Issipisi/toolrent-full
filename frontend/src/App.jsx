import './App.css'
import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom'
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
import { useKeycloak } from "@react-keycloak/web";


function App() {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) return <div>Cargando...</div>;
  if (!keycloak.authenticated) {
    keycloak.login();
    return null;
  }

  // ---- rol del usuario ----
  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const userRole = roles.includes("ADMIN") ? "ADMIN" : roles.includes("EMPLOYEE") ? "EMPLOYEE" : null;

  const PrivateRoute = ({ element, rolesAllowed }) => {
    if (!rolesAllowed.some(r => roles.includes(r))) {
      return <h2>No tienes permiso para ver esta página</h2>;
    }
    return element;
  }; 

  return (
    <Router>
      <div className="container">
        <Navbar userRole={userRole} />
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />

          {/* Solo ADMIN puede ver clientes */}
        <Route
          path="/customers/*"
          element={ <PrivateRoute element={<CustomerView />} rolesAllowed={["ADMIN"]}/>}
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

      </div>
    </Router>
  );
}

export default App
