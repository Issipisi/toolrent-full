import http from 'k6/http';
import { check, sleep } from 'k6';
import { getAuthToken, getAuthHeaders } from '../auth-helper.js';

export const options = {
  stages: [
    { duration: '30s', target: 50 },    // Sube a 50
    { duration: '30s', target: 100 },   // Sube a 100
    { duration: '30s', target: 200 },   // Sube a 200
    { duration: '30s', target: 400 },   // Sube a 400
    { duration: '30s', target: 800 },   // Sube a 800
    { duration: '30s', target: 1200 },  // Sube a 1200
    { duration: '30s', target: 2000 },  // Sube a 2000
    { duration: '30s', target: 0 },     // Baja
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<5000'], // Umbral alto para estrés
  },
};

const BASE_URL = 'http://10.252.181.173:8090';

export function setup() {
  try {
    const token = getAuthToken('employee');
    console.log(' Token obtenido para épica 6 stress testing');
    return { token };
  } catch (error) {
    console.error(' Error obteniendo token:', error);
    return { token: null };
  }
}

export default function(data) {
  if (!data.token) return;
  
  const headers = getAuthHeaders(data.token);
  
  // Endpoint más pesado (rango muy amplio para estresar)
  const from = '2020-01-01T00:00:00'; // Desde el principio
  const to = new Date().toISOString();
  
  const res = http.get(
    `${BASE_URL}/reports/top-tools?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { headers }
  );
  
  check(res, {
    'status OK o error': (r) => r.status === 200 || r.status >= 500,
  });

  if (res.status >= 500) {
    console.log(` Punto de quiebre detectado: ${res.status} en VU=${__VU}`);
  }

  sleep(1);
}