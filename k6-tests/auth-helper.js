// auth-helper.js - Manejador de autenticación para K6
import encoding from 'k6/encoding';
import http from 'k6/http';

// Configuración de Keycloak (TUS DATOS)
const KEYCLOAK_URL = 'http://localhost:8082';
const REALM = 'toolrent-realm';
const CLIENT_ID = 'toolrent-frontend';
const CLIENT_SECRET = '1GSDFfYxYRV95wx3JZZGpbc9nsOnyQsM';

// Credenciales de prueba (DEBES CREAR ESTOS USUARIOS EN KEYCLOAK)
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

/**
 * Obtiene token de Keycloak usando password grant
 */
export function getAuthToken(role = 'employee') {
  const user = USERS[role] || USERS.employee;
  
  // Preparar credenciales Basic Auth con client-secret
  const credentials = `${CLIENT_ID}:${CLIENT_SECRET}`;
  const encodedCredentials = encoding.b64encode(credentials);
  
  // Payload para obtener token
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

  // Convertir payload a form-urlencoded
  const formPayload = Object.entries(payload)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  // Hacer request a Keycloak
  const url = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
  console.log(`🔑 Solicitando token para ${user.username}...`);
  
  const response = http.post(url, formPayload, params);

  if (response.status !== 200) {
    console.error(`❌ Error obteniendo token: ${response.status}`);
    console.error(`Respuesta: ${response.body}`);
    throw new Error(`No se pudo obtener token: ${response.status}`);
  }

  const tokenData = JSON.parse(response.body);
  console.log('✅ Token obtenido correctamente');
  return tokenData.access_token;
}

/**
 * Obtiene headers de autenticación con el token
 */
export function getAuthHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}