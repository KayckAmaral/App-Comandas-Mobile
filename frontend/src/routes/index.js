import React from 'react';
import { Text, View, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ComandasScreen from '../screens/ComandasScreen';
import NovaComandaScreen from '../screens/NovaComandaScreen';
import DetalhesComandaScreen from '../screens/DetalhesComandaScreen';
import EditarComandaScreen from '../screens/EditarComandaScreen';
import EstoqueScreen from '../screens/EstoqueScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack de Autenticação (Login/Registro)
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Botão de voltar customizado: só seta, fundo circular branco translúcido
function CustomBackButton({ canGoBack, onPress }) {
  if (!canGoBack) return null;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={backStyles.button}
      activeOpacity={0.7}
      accessibilityLabel="Voltar"
    >
      <Text style={backStyles.icon}>‹</Text>
    </TouchableOpacity>
  );
}

const backStyles = StyleSheet.create({
  button: {
    marginLeft: 12,
    marginBottom: 6,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  icon: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 22,
  },
});

// Stack de Comandas
function ComandasStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#E57373',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
        headerLeft: (props) => <CustomBackButton {...props} />,
      }}
    >
      <Stack.Screen
        name="ListaComandas"
        component={ComandasScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NovaComanda"
        component={NovaComandaScreen}
        options={{ title: 'Nova Comanda' }}
      />
      <Stack.Screen
        name="DetalhesComanda"
        component={DetalhesComandaScreen}
        options={{ title: 'Detalhes da Comanda' }}
      />
      <Stack.Screen
        name="EditarComanda"
        component={EditarComandaScreen}
        options={{ title: 'Editar Comanda' }}
      />
    </Stack.Navigator>
  );
}

// Tab Navigator Principal (após login)
function AppTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#E57373',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#E57373',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="🏠" color={color} size={size} />
          ),
          headerTitle: 'FastComanda',
        }}
      />
      <Tab.Screen
        name="Comandas"
        component={ComandasStack}
        options={{
          title: 'Comandas',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="📋" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Estoque"
        component={EstoqueScreen}
        options={{
          title: 'Estoque',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="📦" color={color} size={size} />
          ),
          headerTitle: 'Gerenciar Estoque',
        }}
      />
    </Tab.Navigator>
  );
}

// Componente auxiliar para ícones emoji
function TabIcon({ name, size }) {
  return (
    <Text style={{ fontSize: size * 0.8 }}>{name}</Text>
  );
}

// Navegação Principal
export default function Routes() {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E57373' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {signed ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
