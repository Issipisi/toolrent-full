import http from 'k6/http';
import { check, sleep } from 'k6';
import { getAuthToken, getAuthHeaders } from '../auth-helper.js';

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '30s', target: 200 },
    { duration: '30s', target: 400 },
    { duration: '30s', target: 800 },
    { duration: '30s', target: 1200 },
    { duration: '30s', target: 2000 },
    { duration: '30s', target: 3000 }, // Aumentado
    { duration: '30s', target: 4000 }, // Aumentado
    { duration: '30s', target: 5000 }, // Aumentado
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<10000'],
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
  
  const from = '2024-01-01T00:00:00';
  const to = new Date().toISOString();
  
  const res = http.get(
    `${BASE_URL}/reports/top-tools?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { 
      headers,
      tags: { name: 'ReportsTop' }
    }
  );
  
  check(res, {
    'status OK o error': (r) => r.status === 200 || r.status >= 500,
  });

  if (res.status >= 500) {
    console.log(` Punto de quiebre detectado: ${res.status} en VU=${__VU}`);
  } else {
    console.log(` VU=${__VU}, Tiempo=${res.timings.duration}ms`);
  }

  sleep(1);
}