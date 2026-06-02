import React, { useState, useRef } from 'react';
import { Text, View, ActivityIndicator, TouchableOpacity, StyleSheet, Animated, Modal, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { DrawerProvider, useDrawerMenu } from '../contexts/DrawerContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ComandasScreen from '../screens/ComandasScreen';
import NovaComandaScreen from '../screens/NovaComandaScreen';
import DetalhesComandaScreen from '../screens/DetalhesComandaScreen';
import EditarComandaScreen from '../screens/EditarComandaScreen';
import EstoqueScreen from '../screens/EstoqueScreen';
import ClientesScreen from '../screens/ClientesScreen';
import DetalhesClienteScreen from '../screens/DetalhesClienteScreen';
import RelatoriosScreen from '../screens/RelatoriosScreen';

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
          backgroundColor: '#E53935',
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

// Menu lateral animado — substitui a barra de abas inferior.
// O swipe entre telas é mantido pelo Material Top Tabs.
function SidebarTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-270)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isGerente = !user?.role || user?.role === 'gerente';
  const drawerMenuRef = useDrawerMenu();

  if (drawerMenuRef) drawerMenuRef.current = openDrawer;

  function openDrawer() {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }

  function closeDrawer(onDone) {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: -270, useNativeDriver: true, tension: 65, friction: 11 }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => { setDrawerOpen(false); onDone?.(); });
  }

  function navegarPara(routeName) {
    navigation.navigate(routeName);
    closeDrawer();
  }

  const currentRoute = state.routes[state.index];
  const currentTitle = descriptors[currentRoute.key]?.options?.title ?? currentRoute.name;

  return (
    <>
      {/* Barra inferior minimalista */}
      <View style={[barStyles.bar, { paddingBottom: insets.bottom, height: 52 + insets.bottom }]}>
        <TouchableOpacity
          style={barStyles.novaBtn}
          onPress={() => navigation.navigate('Comandas', { screen: 'NovaComanda' })}
          activeOpacity={0.7}
        >
          <Text style={barStyles.novaIcon}>＋</Text>
          <Text style={barStyles.novaLabel}>Nova</Text>
        </TouchableOpacity>

        <View style={barStyles.centerSection}>
          <Text style={barStyles.screenTitle}>{currentTitle}</Text>
          <View style={barStyles.dotsRow}>
            {state.routes.map((_, i) => (
              <View key={i} style={[barStyles.dot, state.index === i && barStyles.dotAtivo]} />
            ))}
          </View>
        </View>

        <TouchableOpacity onPress={openDrawer} style={barStyles.avatarBtn} activeOpacity={0.7}>
          <View style={barStyles.avatarCircle}>
            <Text style={barStyles.avatarText}>
              {user?.nome?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Menu lateral */}
      <Modal transparent animationType="none" visible={drawerOpen} onRequestClose={() => closeDrawer()}>
        <View style={{ flex: 1 }}>
          {/* Backdrop escurecido */}
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)', opacity: fadeAnim }]}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => closeDrawer()} />
          </Animated.View>

          {/* Painel deslizante */}
          <Animated.View style={[drawerStyles.panel, { paddingTop: insets.top, transform: [{ translateX: slideAnim }] }]}>
            {/* Cabeçalho */}
            <View style={drawerStyles.header}>
              <Text style={drawerStyles.appName}>🍽️ FastComanda</Text>
              <Text style={drawerStyles.userName}>{user?.nome}</Text>
              <View style={[drawerStyles.roleBadge, !isGerente && drawerStyles.roleBadgeGarcom]}>
                <Text style={drawerStyles.roleText}>{isGerente ? 'Gerente' : 'Garçom'}</Text>
              </View>
            </View>

            <View style={drawerStyles.separator} />

            {/* Itens de navegação */}
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label = options.title ?? route.name;
              const isFocused = state.index === index;
              return (
                <TouchableOpacity
                  key={route.key}
                  style={[drawerStyles.item, isFocused && drawerStyles.itemAtivo]}
                  onPress={() => navegarPara(route.name)}
                  activeOpacity={0.75}
                >
                  <View style={drawerStyles.itemIcon}>
                    {options.tabBarIcon?.({ focused: isFocused, color: isFocused ? '#E53935' : '#555', size: 22 })}
                  </View>
                  <Text style={[drawerStyles.itemLabel, isFocused && drawerStyles.itemLabelAtivo]}>
                    {label}
                  </Text>
                  {isFocused && <View style={drawerStyles.itemDot} />}
                </TouchableOpacity>
              );
            })}

            <View style={drawerStyles.separator} />

            <TouchableOpacity
              style={drawerStyles.item}
              onPress={() => closeDrawer(() =>
                Alert.alert('Sair', 'Deseja realmente sair?', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Sair', style: 'destructive', onPress: signOut },
                ])
              )}
              activeOpacity={0.75}
            >
              <View style={drawerStyles.itemIcon}>
                <Text style={{ fontSize: 18 }}>🚪</Text>
              </View>
              <Text style={[drawerStyles.itemLabel, drawerStyles.itemLabelSair]}>Sair</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const barStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  novaBtn: { alignItems: 'center', justifyContent: 'center', padding: 8, minWidth: 56 },
  novaIcon: { fontSize: 22, color: '#E53935', fontWeight: 'bold' },
  novaLabel: { fontSize: 10, color: '#E53935', fontWeight: '700', marginTop: 1 },
  centerSection: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  screenTitle: { fontSize: 15, fontWeight: '600', color: '#333', textAlign: 'center' },
  dotsRow: { flexDirection: 'row', gap: 5, marginTop: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ddd' },
  dotAtivo: { width: 28, height: 8, borderRadius: 4, backgroundColor: '#E53935' },
  avatarBtn: { alignItems: 'center', justifyContent: 'center', minWidth: 56 },
  avatarCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#E53935', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});

const drawerStyles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    width: 270,
    backgroundColor: '#fff',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  header: { padding: 24, paddingTop: 20, backgroundColor: '#E53935' },
  appName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  userName: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 8 },
  roleBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12,
  },
  roleBadgeGarcom: { backgroundColor: 'rgba(255,255,255,0.15)' },
  roleText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 16, marginVertical: 8 },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 10, marginHorizontal: 8, marginVertical: 2,
  },
  itemAtivo: { backgroundColor: '#FFEBEE' },
  itemIcon: { width: 30, alignItems: 'center' },
  itemLabel: { flex: 1, fontSize: 15, color: '#444', fontWeight: '500', marginLeft: 14 },
  itemLabelAtivo: { color: '#E53935', fontWeight: '700' },
  itemDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#E53935' },
  itemLabelSair: { color: '#f44336' },
});

// Stack de Clientes
function ClientesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#E53935' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false,
        headerLeft: (props) => <CustomBackButton {...props} />,
      }}
    >
      <Stack.Screen name="ListaClientes" component={ClientesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DetalhesCliente" component={DetalhesClienteScreen} options={{ title: 'Detalhes do Cliente' }} />
    </Stack.Navigator>
  );
}

// Tab Navigator Principal (após login) — material-top-tabs no rodapé
// dá swipe horizontal entre as abas em qualquer ponto da tela.
function AppTabs() {
  const { user } = useAuth();
  // Fallback para gerente caso token antigo não tenha role
  const isGerente = !user?.role || user?.role === 'gerente';

  return (
    <DrawerProvider>
    <Tab.Navigator
      tabBarPosition="bottom"
      tabBar={(props) => <SidebarTabBar {...props} />}
      initialRouteName={isGerente ? 'Dashboard' : 'Comandas'}
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
        lazy: false,
      }}
    >
      {isGerente && (
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'Início',
            tabBarIcon: ({ size }) => <TabIcon name="🏠" size={size} />,
          }}
        />
      )}
      <Tab.Screen
        name="Comandas"
        component={ComandasStack}
        options={{
          title: 'Comandas',
          tabBarIcon: ({ size }) => <TabIcon name="📋" size={size} />,
        }}
      />
      <Tab.Screen
        name="Clientes"
        component={ClientesStack}
        options={{
          title: 'Clientes',
          tabBarIcon: ({ size }) => <TabIcon name="👥" size={size} />,
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
      {isGerente && (
        <Tab.Screen
          name="Relatorios"
          component={RelatoriosScreen}
          options={{
            title: 'Relatórios',
            tabBarIcon: ({ size }) => <TabIcon name="📊" size={size} />,
          }}
        />
      )}
    </Tab.Navigator>
    </DrawerProvider>
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E53935' }}>
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
