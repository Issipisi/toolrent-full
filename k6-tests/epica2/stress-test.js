import http from 'k6/http';
import { check, sleep } from 'k6';
import { getAuthToken, getAuthHeaders } from '../auth-helper.js';

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '30s', target: 200 },
    { duration: '30s', target: 500 },
    { duration: '30s', target: 1000 },
    { duration: '30s', target: 2000 },
    { duration: '30s', target: 3000 },
    { duration: '30s', target: 4000 },
    { duration: '30s', target: 5000 },
    { duration: '30s', target: 6000 }, // Aumentado
    { duration: '30s', target: 7000 }, // Aumentado
    { duration: '30s', target: 8000 }, // Aumentado
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<5000'], // Aumentado para estrés
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
  
  // Fechas acotadas para no sobrecargar
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const to = new Date().toISOString();
  
  const res = http.get(
    `${BASE_URL}/loans/active?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { 
      headers,
      tags: { name: 'LoansActive' }
    }
  );
  
  check(res, {
    'status es 200 o 500 (punto de quiebre)': (r) => r.status === 200 || r.status >= 500,
    'tiempo de respuesta < 10s': (r) => r.timings.duration < 10000,
  });

  if (res.status >= 500) {
    console.log(` Punto de quiebre detectado en VU=${__VU}, status=${res.status}`);
  } else {
    console.log(` VU=${__VU}, Tiempo=${res.timings.duration}ms`);
  }

  sleep(1);
}