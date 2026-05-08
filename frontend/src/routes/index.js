import React from 'react';
import { Text, View, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
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
const Tab = createMaterialTopTabNavigator();

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

// TabBar customizado (idêntico visualmente ao bottom-tabs antigo).
// Usado pelo material-top-tabs no rodapé, com swipe nativo via pager-view.
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        tabBarStyles.bar,
        { paddingBottom: insets.bottom, height: 60 + insets.bottom },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const isFocused = state.index === index;
        const color = isFocused ? '#E57373' : '#999';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={tabBarStyles.item}
            activeOpacity={0.7}
          >
            {options.tabBarIcon &&
              options.tabBarIcon({ focused: isFocused, color, size: 28 })}
            <Text style={[tabBarStyles.label, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabBarStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});

// Tab Navigator Principal (após login) — material-top-tabs no rodapé
// dá swipe horizontal entre as 3 abas em qualquer ponto da tela.
function AppTabs() {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
        lazy: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Início',
          tabBarIcon: ({ size }) => <TabIcon name="🏠" size={size} />,
        }}
      />
      <Tab.Screen
        name="Comandas"
        component={ComandasStack}
        options={{
          title: 'Comandas',
          tabBarIcon: ({ size }) => <TabIcon name="📋" size={size} />,
        }}
      />
      <Tab.Screen
        name="Estoque"
        component={EstoqueScreen}
        options={{
          title: 'Estoque',
          tabBarIcon: ({ size }) => <TabIcon name="📦" size={size} />,
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
