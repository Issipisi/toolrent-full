import http from 'k6/http';
import { check, sleep } from 'k6';
import { getAuthToken, getAuthHeaders } from '../auth-helper.js';

export const options = {
  scenarios: {
    // Prueba con 10 usuarios
    constant_10: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      startTime: '0s',
    },
    // Prueba con 50 usuarios
    constant_50: {
      executor: 'constant-vus',
      vus: 50,
      duration: '30s',
      startTime: '30s',
    },
    // Prueba con 100 usuarios
    constant_100: {
      executor: 'constant-vus',
      vus: 100,
      duration: '30s',
      startTime: '60s',
    },
    // Prueba con 500 usuarios
    constant_500: {
      executor: 'constant-vus',
      vus: 500,
      duration: '30s',
      startTime: '90s',
    },
    // Prueba con 1000 usuarios
    constant_1000: {
      executor: 'constant-vus',
      vus: 1000,
      duration: '30s',
      startTime: '120s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // Menos del 1% de errores
    http_req_duration: ['p(95)<500'], // 95% de las peticiones < 500ms
  },
};

// TU BACKEND
const BASE_URL = 'http://10.252.181.173:8090';

export function setup() {
  try {
    const token = getAuthToken('employee');
    return { token };
  } catch (error) {
    console.error('❌ Error en setup:', error);
    return { token: null };
  }
}

export default function(data) {
  // Si no hay token, no continuar
  if (!data.token) {
    console.error('No hay token disponible');
    return;
  }
  
  const headers = getAuthHeaders(data.token);
  
  // ===== TEST 1: Listar préstamos activos =====
  const res1 = http.get(`${BASE_URL}/loans/active`, { headers });
  check(res1, {
    'GET /loans/active status 200': (r) => r.status === 200,
    'GET /loans/active es array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch {
        return false;
      }
    },
    'GET /loans/active tiempo < 500ms': (r) => r.timings.duration < 500,
  });

  if (res1.status !== 200) {
    console.log(`⚠️ Error ${res1.status} en /loans/active: ${res1.body.substring(0, 100)}`);
  }

  sleep(1);

  // ===== TEST 2: Listar préstamos con deudas =====
  const res2 = http.get(`${BASE_URL}/loans/pending-payment`, { headers });
  check(res2, {
    'GET /loans/pending-payment status 200': (r) => r.status === 200,
    'GET /loans/pending-payment es array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}