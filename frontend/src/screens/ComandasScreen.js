import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';

export default function ComandasScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadComandas();
    }, [])
  );

  async function loadComandas() {
    try {
      const response = await api.get('/comandas');
      setComandas(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar comandas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as comandas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadComandas();
  }

  function getStatusColor(status) {
    switch (status) {
      case 'aberta':
        return '#4CAF50';
      case 'fechada':
        return '#2196F3';
      case 'cancelada':
        return '#f44336';
      default:
        return '#9E9E9E';
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function renderComanda({ item }) {
    return (
      <TouchableOpacity
        style={styles.comandaCard}
        onPress={() => navigation.navigate('DetalhesComanda', { comandaId: item.id })}
      >
        <View style={styles.comandaHeader}>
          <Text style={styles.comandaId}>Comanda #{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.comandaInfo}>
          <Text style={styles.infoLabel}>Cliente:</Text>
          <Text style={styles.infoValue}>
            {item.cliente_nome || 'Sem cliente'}
          </Text>
        </View>

        <View style={styles.comandaInfo}>
          <Text style={styles.infoLabel}>Tipo:</Text>
          <Text style={styles.infoValue}>
            {item.tipo_venda === 'vista' ? 'À Vista' : 'Fiado'}
          </Text>
        </View>

        <View style={styles.comandaInfo}>
          <Text style={styles.infoLabel}>Total:</Text>
          <Text style={styles.totalValue}>
            R$ {Number(item.valor_total).toFixed(2)}
          </Text>
        </View>

        <Text style={styles.dateText}>{formatDate(item.data_abertura)}</Text>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E57373" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Comandas</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => navigation.navigate('NovaComanda')}
        >
          <Text style={styles.newButtonText}>+ Nova</Text>
        </TouchableOpacity>
      </View>

      {comandas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📋</Text>
          <Text style={styles.emptyMessage}>Nenhuma comanda encontrada</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('NovaComanda')}
          >
            <Text style={styles.emptyButtonText}>Criar primeira comanda</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={comandas}
          renderItem={renderComanda}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  newButton: {
    backgroundColor: '#E57373',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    padding: 20,
  },
  comandaCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  comandaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  comandaId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  comandaInfo: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 60,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  totalValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E57373',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#E57373',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
