import http from 'k6/http';
import { check, sleep } from 'k6';
import { getAuthToken, getAuthHeaders } from '../auth-helper.js';

export const options = {
  stages: [
    { duration: '30s', target: 100 },   // Sube a 100 usuarios
    { duration: '30s', target: 200 },   // Sube a 200
    { duration: '30s', target: 500 },   // Sube a 500
    { duration: '30s', target: 1000 },  // Sube a 1000
    { duration: '30s', target: 2000 },  // Sube a 2000
    { duration: '30s', target: 3000 },  // Sube a 3000
    { duration: '30s', target: 4000 },  // Sube a 4000
    { duration: '30s', target: 5000 },  // Sube a 5000
    { duration: '30s', target: 0 },     // Baja a 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
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
  
  const res = http.get(`${BASE_URL}/loans/active`, { headers });
  
  check(res, {
    'status es 200 o 500 (punto de quiebre)': (r) => r.status === 200 || r.status >= 500,
    'tiempo de respuesta < 10s': (r) => r.timings.duration < 10000,
  });

  if (res.status >= 500) {
    console.log(` Punto de quiebre detectado en VU=${__VU}, status=${res.status}`);
  }

  sleep(1);
}