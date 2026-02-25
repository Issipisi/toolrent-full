import http from 'k6/http';
import { check, sleep } from 'k6';
import { getAuthToken, getAuthHeaders } from '../auth-helper.js';

export const options = {
  scenarios: {
    low_volume: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      env: { DB_SIZE: '1000' },
    },
    medium_volume: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      startTime: '30s',
      env: { DB_SIZE: '10000' },
    },
    high_volume: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      startTime: '60s',
      env: { DB_SIZE: '50000' },
    },
    extreme_volume: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      startTime: '90s',
      env: { DB_SIZE: '100000' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<200'], // Bajamos umbral a 200ms
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
  
  // Fechas fijas para consistencia en volume testing
  const from = '2024-01-01T00:00:00';
  const to = '2024-12-31T23:59:59';
  
  const res = http.get(
    `${BASE_URL}/loans/active?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { 
      headers,
      tags: { name: 'LoansActive' }
    }
  );
  
  check(res, {
    'status 200': (r) => r.status === 200,
  });

  console.log(` Volumen BD: ${__ENV.DB_SIZE}, Tiempo: ${res.timings.duration}ms`);

  sleep(1);
}