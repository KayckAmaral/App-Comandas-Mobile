import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { registerForPushNotificationsAsync } from '../services/notifications';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  async function loadStoredData() {
    try {
      const storedUser = await AsyncStorage.getItem('@fastcomanda:user');
      const storedToken = await AsyncStorage.getItem('@fastcomanda:token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, senha) {
    try {
      // Obter token de push antes de fazer login
      const expoPushToken = await registerForPushNotificationsAsync();

      const response = await api.post('/auth/login', {
        email,
        senha,
        expoPushToken,
      });

      const { data } = response.data;

      // Salvar no AsyncStorage
      await AsyncStorage.setItem('@fastcomanda:user', JSON.stringify(data));
      await AsyncStorage.setItem('@fastcomanda:token', data.token);

      setUser(data);

      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login',
      };
    }
  }

  async function signUp(nome, email, senha) {
    try {
      const response = await api.post('/auth/register', {
        nome,
        email,
        senha,
      });

      const { data } = response.data;

      // Após registro, fazer login automático
      await AsyncStorage.setItem('@fastcomanda:user', JSON.stringify(data));
      await AsyncStorage.setItem('@fastcomanda:token', data.token);

      setUser(data);

      // Registrar para notificações após cadastro (sem refazer login).
      // O push token será gravado no próximo signIn normal do usuário.
      await registerForPushNotificationsAsync();

      return { success: true };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer cadastro',
      };
    }
  }

  async function signOut() {
    try {
      await AsyncStorage.removeItem('@fastcomanda:user');
      await AsyncStorage.removeItem('@fastcomanda:token');
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}
