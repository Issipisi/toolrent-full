import http from 'k6/http';
import { check, sleep } from 'k6';
import { getAuthToken, getAuthHeaders } from '../auth-helper.js';

export const options = {
  scenarios: {
    low_volume: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
      env: { DB_SIZE: '1000' },
    },
    medium_volume: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
      startTime: '30s',
      env: { DB_SIZE: '10000' },
    },
    high_volume: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
      startTime: '1m0s',
      env: { DB_SIZE: '50000' },
    },
    extreme_volume: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
      startTime: '1m30s',
      env: { DB_SIZE: '100000' },
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<200'], // Bajado a 200ms
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
  
  const currentVolume = __ENV.DB_SIZE || 'desconocido';
  console.log(` Probando volumen BD: ${currentVolume} registros`);
  
  const from = '2024-01-01T00:00:00';
  const to = '2024-12-31T23:59:59';
  
  // TEST 1: Reporte activos
  const res1 = http.get(
    `${BASE_URL}/reports/active-loans?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { 
      headers,
      tags: { name: 'ReportsActive' }
    }
  );
  check(res1, {
    'active-loans status 200': (r) => r.status === 200,
  });
  console.log(`     Active loans: ${res1.timings.duration}ms`);
  
  sleep(1);
  
  // TEST 2: Top herramientas
  const res2 = http.get(
    `${BASE_URL}/reports/top-tools?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { 
      headers,
      tags: { name: 'ReportsTop' }
    }
  );
  check(res2, {
    'top-tools status 200': (r) => r.status === 200,
  });
  console.log(`     Top tools: ${res2.timings.duration}ms`);
  
  sleep(1);
  
  // TEST 3: Clientes con deuda
  const res3 = http.get(
    `${BASE_URL}/reports/customers-with-debt`,
    { 
      headers,
      tags: { name: 'ReportsDebt' }
    }
  );
  check(res3, {
    'customers-with-debt status 200': (r) => r.status === 200,
  });
  console.log(`     Customers with debt: ${res3.timings.duration}ms`);
  console.log('---');
  
  sleep(1);
}