import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 3000;

// Permite forçar uma URL via app.json (expo.extra.apiUrl) — útil para produção
// ou quando você quiser fixar manualmente o endereço do backend.
const manualApiUrl = Constants.expoConfig?.extra?.apiUrl;

// Extrai o IP da máquina de desenvolvimento que o Metro/Expo está usando.
// Funciona no Expo Go (Android e iPhone físicos) porque o Expo expõe o host
// do bundler via Constants. Em diferentes versões do SDK o caminho muda,
// então tentamos várias possibilidades.
function getDevServerHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest?.hostUri;

  if (!hostUri) return null;
  return hostUri.split(':')[0];
}

function resolveApiUrl() {
  if (manualApiUrl) return manualApiUrl;

  const devHost = getDevServerHost();

  // Dispositivo físico (Expo Go no iPhone, ou celular Android real):
  // usa o IP da máquina onde o Expo está rodando — mesma rede WiFi.
  if (devHost && devHost !== 'localhost' && devHost !== '127.0.0.1') {
    return `http://${devHost}:${API_PORT}/api`;
  }

  // Android Emulator (Android Studio): 10.0.2.2 é o alias do host.
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}/api`;
  }

  // iOS Simulator: localhost funciona normalmente.
  return `http://localhost:${API_PORT}/api`;
}

const API_URL = resolveApiUrl();
console.log('[API] baseURL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@fastcomanda:token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erro ao buscar token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      await AsyncStorage.removeItem('@fastcomanda:token');
      await AsyncStorage.removeItem('@fastcomanda:user');
    }
    return Promise.reject(error);
  }
);

export default api;
