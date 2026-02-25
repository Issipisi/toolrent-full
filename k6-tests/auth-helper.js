// auth-helper.js - VERSIÓN OPTIMIZADA
import encoding from 'k6/encoding';
import http from 'k6/http';

// Configuración de Keycloak
const KEYCLOAK_URL = 'http://localhost:8082';
const REALM = 'toolrent-realm';
const CLIENT_ID = 'toolrent-frontend';
const CLIENT_SECRET = '1GSDFfYxYRV95wx3JZZGpbc9nsOnyQsM';

const USERS = {
  admin: {
    username: 'IsiAdmin',
    password: 'admin',  
  },
  employee: {
    username: 'test-employee',
    password: 'admin',  
  }
};

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Obtiene token de Keycloak con cache
 */
export function getAuthToken(role = 'employee') {
  // Usar token cacheado si aún es válido
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  
  const user = USERS[role] || USERS.employee;
  
  const credentials = `${CLIENT_ID}:${CLIENT_SECRET}`;
  const encodedCredentials = encoding.b64encode(credentials);
  
  const payload = {
    grant_type: 'password',
    username: user.username,
    password: user.password,
    client_id: CLIENT_ID,
  };

  const params = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${encodedCredentials}`,
    },
  };

  const formPayload = Object.entries(payload)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  const url = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
  console.log(` Solicitando token para ${user.username}...`);
  
  const response = http.post(url, formPayload, params);

  if (response.status !== 200) {
    console.error(` Error obteniendo token: ${response.status}`);
    throw new Error(`No se pudo obtener token: ${response.status}`);
  }

  const tokenData = JSON.parse(response.body);
  
  // Cachear token (expira en 5 minutos)
  cachedToken = tokenData.access_token;
  tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000;
  
  console.log(' Token obtenido correctamente');
  return cachedToken;
}

/**
 * Obtiene headers de autenticación con tags para agrupar métricas
 */
export function getAuthHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Test-Run': 'toolrent-k6',
    'User-Agent': 'k6-toolrent',
  };
}