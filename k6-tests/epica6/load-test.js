import http from 'k6/http';
import { check, sleep } from 'k6';
import { getAuthToken, getAuthHeaders } from '../auth-helper.js';

export const options = {
  scenarios: {
    vus_10: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
    },
    vus_50: {
      executor: 'constant-vus',
      vus: 50,
      duration: '30s',
      startTime: '30s',
    },
    vus_100: {
      executor: 'constant-vus',
      vus: 100,
      duration: '30s',
      startTime: '1m0s',
    },
    vus_500: {
      executor: 'constant-vus',
      vus: 500,
      duration: '30s',
      startTime: '1m30s',
    },
    vus_1000: {
      executor: 'constant-vus',
      vus: 1000,
      duration: '30s',
      startTime: '2m0s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1500'], // Bajado a 1.5s
  },
};

const BASE_URL = 'http://10.252.181.173:8090';

export function setup() {
  try {
    const token = getAuthToken('employee');
    return { token };
  } catch (error) {
    console.error(' Error obteniendo token:', error);
    return { token: null };
  }
}

export default function(data) {
  if (!data.token) return;
  
  const headers = getAuthHeaders(data.token);
  
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const to = new Date().toISOString();
  
  // ===== TEST 1: Reporte de préstamos activos =====
  const res1 = http.get(
    `${BASE_URL}/reports/active-loans?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { 
      headers,
      tags: { name: 'ReportsActive' }
    }
  );
  check(res1, {
    'GET /reports/active-loans status 200': (r) => r.status === 200,
  });

  sleep(1);

  // ===== TEST 2: Reporte top herramientas =====
  const res2 = http.get(
    `${BASE_URL}/reports/top-tools?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { 
      headers,
      tags: { name: 'ReportsTop' }
    }
  );
  check(res2, {
    'GET /reports/top-tools status 200': (r) => r.status === 200,
  });

  sleep(1);

  // ===== TEST 3: Clientes con deudas =====
  const res3 = http.get(
    `${BASE_URL}/reports/customers-with-debt`,
    { 
      headers,
      tags: { name: 'ReportsDebt' }
    }
  );
  check(res3, {
    'GET /reports/customers-with-debt status 200': (r) => r.status === 200,
  });
}