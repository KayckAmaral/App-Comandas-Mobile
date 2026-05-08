import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import Routes from './src/routes';
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
} from './src/services/notifications';

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Listener para quando uma notificação é recebida enquanto o app está aberto
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('📨 Notificação recebida:', notification);
      // Aqui você pode mostrar um alert ou fazer alguma ação
    });

    // Listener para quando o usuário toca em uma notificação
    responseListener.current = addNotificationResponseReceivedListener((response) => {
      console.log('👆 Notificação tocada:', response);
      // Aqui você pode navegar para uma tela específica
      const data = response.notification.request.content.data;
      
      if (data.tipo === 'estoque_baixo') {
        // Navegar para a tela de estoque, por exemplo
        console.log('Navegar para estoque:', data);
      }
    });

    // Cleanup
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#E57373" />
        <Routes />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
