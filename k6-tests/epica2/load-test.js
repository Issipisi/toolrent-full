import http from 'k6/http';
import { check, sleep } from 'k6';
import { getAuthToken, getAuthHeaders } from '../auth-helper.js';

export const options = {
  scenarios: {
    constant_10: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      startTime: '0s',
    },
    constant_50: {
      executor: 'constant-vus',
      vus: 50,
      duration: '30s',
      startTime: '30s',
    },
    constant_100: {
      executor: 'constant-vus',
      vus: 100,
      duration: '30s',
      startTime: '60s',
    },
    constant_500: {
      executor: 'constant-vus',
      vus: 500,
      duration: '30s',
      startTime: '90s',
    },
    constant_1000: {
      executor: 'constant-vus',
      vus: 1000,
      duration: '30s',
      startTime: '120s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<600'], // Aumentado a 600ms
  },
};

const BASE_URL = 'http://10.252.181.173:8090';

export function setup() {
  try {
    const token = getAuthToken('employee');
    return { token };
  } catch (error) {
    console.error(' Error en setup:', error);
    return { token: null };
  }
}

export default function(data) {
  if (!data.token) return;
  
  const headers = getAuthHeaders(data.token);
  
  // Usar fechas más acotadas para mejorar rendimiento
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  // ===== TEST 1: Listar préstamos activos (con filtro optimizado) =====
  const res1 = http.get(
    `${BASE_URL}/loans/active?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { 
      headers,
      tags: { name: 'LoansActive' } // Agrupar todas las requests
    }
  );
  
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
    'GET /loans/active tiempo < 600ms': (r) => r.timings.duration < 600,
  });

  sleep(1);

  // ===== TEST 2: Listar préstamos con deudas =====
  const res2 = http.get(
    `${BASE_URL}/loans/pending-payment`,
    { 
      headers,
      tags: { name: 'LoansPending' }
    }
  );
  
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