import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import keycloak from "./services/keycloak.js";

ReactDOM.createRoot(document.getElementById('root')).render(
  <ReactKeycloakProvider authClient={keycloak}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </ReactKeycloakProvider>
);


