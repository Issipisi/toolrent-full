import http from 'k6/http';
import { check, sleep } from 'k6';
import { getAuthToken, getAuthHeaders } from '../auth-helper.js';

export const options = {
  scenarios: {
    // Volumen bajo: 1000 registros
    low_volume: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      env: { DB_SIZE: '1000' },
    },
    // Volumen medio: 10000 registros
    medium_volume: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      startTime: '30s',
      env: { DB_SIZE: '10000' },
    },
    // Volumen alto: 50000 registros
    high_volume: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      startTime: '60s',
      env: { DB_SIZE: '50000' },
    },
    // Volumen muy alto: 100000 registros
    extreme_volume: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      startTime: '90s',
      env: { DB_SIZE: '100000' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'], // < 1s
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
  if (!data.token) return;
  
  const headers = getAuthHeaders(data.token);
  
  // Para volume testing, usamos endpoints que devuelven muchos datos
  const res = http.get(`${BASE_URL}/loans/active`, { headers });
  
  check(res, {
    'status 200': (r) => r.status === 200,
  });

  // Analizar tiempo según volumen
  console.log(`📊 Volumen BD: ${__ENV.DB_SIZE}, Tiempo: ${res.timings.duration}ms`);

  sleep(1);
}