import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useDrawerMenu } from '../contexts/DrawerContext';
import api from '../services/api';

const logo = require('../../assets/logo.png');

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const drawerMenuRef = useDrawerMenu();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  async function loadDashboardData() {
    try {
      const response = await api.get('/comandas/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadDashboardData();
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => drawerMenuRef?.current?.()} activeOpacity={0.7}>
          <Text style={styles.menuIcon}>☰</Text>
          <Text style={styles.menuLabel}>Menu</Text>
        </TouchableOpacity>

        <Text style={styles.appTitle}>FastComanda</Text>

        <Image source={logo} style={styles.logoImg} resizeMode="contain" />
      </View>

      {/* Cards de Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.total_comandas || 0}</Text>
          <Text style={styles.statLabel}>Comandas Hoje</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            R$ {Number(stats?.valor_total || 0).toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Faturamento</Text>
        </View>
      </View>

      {/* Status das Comandas */}
      {stats?.comandas_por_status && stats.comandas_por_status.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status das Comandas</Text>
          {stats.comandas_por_status.map((item) => (
            <View key={item.status} style={styles.statusItem}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}:
              </Text>
              <Text style={styles.statusValue}>{item.total}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Produtos Mais Vendidos */}
      {stats?.produtos_mais_vendidos && stats.produtos_mais_vendidos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mais Vendidos Hoje</Text>
          {stats.produtos_mais_vendidos.map((produto, index) => (
            <View key={index} style={styles.productItem}>
              <Text style={styles.productRank}>{index + 1}º</Text>
              <Text style={styles.productName}>{produto.nome}</Text>
              <Text style={styles.productQuantity}>{produto.total_vendido}x</Text>
            </View>
          ))}
        </View>
      )}

      {/* Botões de Acesso Rápido */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Comandas')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>Ver Comandas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Comandas', { screen: 'NovaComanda' })}
        >
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionText}>Nova Comanda</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Estoque')}
        >
          <Text style={styles.actionIcon}>📦</Text>
          <Text style={styles.actionText}>Gerenciar Estoque</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Relatorios')}
        >
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionText}>Ver Relatórios</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuBtn: { alignItems: 'center', justifyContent: 'center', minWidth: 48 },
  menuIcon: { fontSize: 24, color: '#E53935' },
  menuLabel: { fontSize: 10, color: '#E53935', fontWeight: '600', marginTop: 1 },
  appTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E53935',
    letterSpacing: 1,
    textAlign: 'center',
  },
  logoImg: { width: 42, height: 42 },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#E53935',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
    marginRight: 12,
  },
  statusText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  productRank: {
    width: 30,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53935',
  },
  productName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  productQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  quickActions: {
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
