import axios from "axios";
import keycloak from "./services/keycloak";

const toolrentBackendServer = import.meta.env.VITE_TOOLRENT_BACKEND_SERVER;
const toolrentBackendPort = import.meta.env.VITE_TOOLRENT_BACKEND_PORT;

console.log(toolrentBackendServer)
console.log(toolrentBackendPort)

const api = axios.create({
  baseURL: `http://${toolrentBackendServer}:${toolrentBackendPort}`,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(async (config) => {
  if (keycloak.authenticated) {
    await keycloak.updateToken(30);
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;