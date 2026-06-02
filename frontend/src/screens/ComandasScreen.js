import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Share,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';

export default function ComandasScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');

  const comandasFiltradas = useMemo(() => {
    return comandas.filter((c) => {
      const termoBusca = busca.toLowerCase();
      const matchBusca =
        !busca ||
        String(c.id).includes(busca) ||
        (c.cliente_nome && c.cliente_nome.toLowerCase().includes(termoBusca)) ||
        (c.mesa && c.mesa.toLowerCase().includes(termoBusca));
      const matchStatus = filtroStatus === 'todas' || c.status === filtroStatus;
      return matchBusca && matchStatus;
    });
  }, [comandas, busca, filtroStatus]);

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

  function confirmarApagar(item) {
    const cliente = item.cliente_nome ? ` (${item.cliente_nome})` : '';
    const total = `R$ ${Number(item.valor_total).toFixed(2)}`;
    Alert.alert(
      'Apagar Comanda',
      `Deseja apagar a Comanda #${item.id}${cliente} no valor de ${total}?\n\nEla sera removida da lista, mas o registro permanece salvo no banco para historico.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => apagarComanda(item.id),
        },
      ]
    );
  }

  async function apagarComanda(id) {
    try {
      await api.delete(`/comandas/${id}`);
      setComandas((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Erro ao apagar comanda:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível apagar a comanda');
    }
  }

  function confirmarFinalizar(item) {
    Alert.alert(
      'Finalizar Comanda',
      `Finalizar ${item.mesa || `#${item.id}`}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: async () => {
            try {
              await api.patch(`/comandas/${item.id}/finalizar`);
              setComandas((prev) =>
                prev.map((c) => (c.id === item.id ? { ...c, status: 'fechada' } : c))
              );
            } catch (error) {
              Alert.alert('Erro', error.response?.data?.message || 'Não foi possível finalizar');
            }
          },
        },
      ]
    );
  }

  function confirmarCancelar(item) {
    Alert.alert(
      'Cancelar Comanda',
      `Cancelar ${item.mesa || `#${item.id}`}? Os itens serão devolvidos ao estoque.`,
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Cancelar Comanda',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.patch(`/comandas/${item.id}/cancelar`);
              setComandas((prev) =>
                prev.map((c) => (c.id === item.id ? { ...c, status: 'cancelada' } : c))
              );
            } catch (error) {
              Alert.alert('Erro', error.response?.data?.message || 'Não foi possível cancelar');
            }
          },
        },
      ]
    );
  }

  async function compartilharComprovante(id) {
    try {
      const res = await api.get(`/comandas/${id}`);
      const c = res.data.data;

      const dataFormatada = new Date(c.data_abertura).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });

      const itensTexto = c.itens
        .map((i) => `  • ${i.produto_nome} x${i.quantidade}   R$ ${Number(i.subtotal).toFixed(2)}`)
        .join('\n');

      const linhas = [
        '🍽️  FastComanda',
        '─────────────────────────',
        `Comanda: #${c.id}${c.mesa ? ` • ${c.mesa}` : ''}`,
        `Data: ${dataFormatada}`,
        c.cliente_nome ? `Cliente: ${c.cliente_nome}` : null,
        `Atendente: ${c.usuario_nome}`,
        '─────────────────────────',
        'ITENS:',
        itensTexto,
        '─────────────────────────',
        `TOTAL: R$ ${Number(c.valor_total).toFixed(2)}`,
        `Pagamento: ${c.tipo_venda === 'vista' ? 'À Vista' : 'Fiado'}`,
        c.observacoes ? `Obs: ${c.observacoes}` : null,
      ].filter(Boolean).join('\n');

      await Share.share({ message: linhas });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o comprovante');
    }
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
        activeOpacity={0.85}
      >
        <View style={styles.comandaHeader}>
          <Text style={styles.comandaMesa}>{item.mesa || `Comanda #${item.id}`}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.comandaSubtitulo}>
          #{item.id}{item.cliente_nome ? ` • ${item.cliente_nome}` : ''}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.comandaInfo}>
            <Text style={styles.infoLabel}>Tipo:</Text>
            <Text style={styles.infoValue}>
              {item.tipo_venda === 'vista' ? 'À Vista' : 'Fiado'}
            </Text>
          </View>
          <View style={styles.comandaInfo}>
            <Text style={styles.infoLabel}>Total:</Text>
            <Text style={styles.totalValue}>R$ {Number(item.valor_total).toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.dateText}>{formatDate(item.data_abertura)}</Text>

        {item.status === 'aberta' && (
          <View style={styles.acoesRow}>
            <TouchableOpacity
              style={[styles.acaoBotao, styles.editarBotao]}
              onPress={() => navigation.navigate('EditarComanda', { comandaId: item.id })}
            >
              <Text style={styles.acaoBotaoText}>✏️ Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.acaoBotao, styles.finalizarBotao]}
              onPress={() => confirmarFinalizar(item)}
            >
              <Text style={styles.acaoBotaoText}>✅ Finalizar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.acaoBotao, styles.cancelarBotao]}
              onPress={() => confirmarCancelar(item)}
            >
              <Text style={styles.acaoBotaoText}>✕ Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status !== 'aberta' && (
          <View style={styles.acoesRow}>
            {item.status === 'fechada' && (
              <TouchableOpacity
                style={[styles.acaoBotao, styles.compartilharBotao]}
                onPress={() => compartilharComprovante(item.id)}
              >
                <Text style={styles.acaoBotaoText}>📤 Comprovante</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.acaoBotao, styles.apagarBotao]}
              onPress={() => confirmarApagar(item)}
            >
              <Text style={styles.acaoBotaoText}>🗑️ Apagar</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
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

      <View style={styles.filtrosContainer}>
        <TextInput
          style={styles.buscaInput}
          placeholder="Buscar por nº, cliente ou mesa..."
          value={busca}
          onChangeText={setBusca}
          clearButtonMode="while-editing"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {[
            { label: 'Todas', value: 'todas' },
            { label: 'Abertas', value: 'aberta' },
            { label: 'Fechadas', value: 'fechada' },
            { label: 'Canceladas', value: 'cancelada' },
          ].map((chip) => (
            <TouchableOpacity
              key={chip.value}
              style={[styles.chip, filtroStatus === chip.value && styles.chipAtivo]}
              onPress={() => setFiltroStatus(chip.value)}
            >
              <Text style={[styles.chipText, filtroStatus === chip.value && styles.chipTextoAtivo]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
      ) : comandasFiltradas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🔍</Text>
          <Text style={styles.emptyMessage}>Nenhuma comanda encontrada para este filtro</Text>
        </View>
      ) : (
        <FlatList
          data={comandasFiltradas}
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
    backgroundColor: '#E53935',
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
    marginBottom: 4,
  },
  comandaMesa: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  comandaSubtitulo: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
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
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  comandaInfo: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: '#888',
    marginRight: 4,
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53935',
  },
  dateText: {
    fontSize: 11,
    color: '#bbb',
    marginTop: 4,
    marginBottom: 10,
  },
  acoesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  acaoBotao: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  acaoBotaoText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  editarBotao: {
    backgroundColor: '#1976D2',
  },
  finalizarBotao: {
    backgroundColor: '#388E3C',
  },
  cancelarBotao: {
    backgroundColor: '#FF9800',
  },
  compartilharBotao: {
    backgroundColor: '#4CAF50',
  },
  apagarBotao: {
    backgroundColor: '#f44336',
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
    backgroundColor: '#E53935',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filtrosContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  buscaInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 10,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  chipAtivo: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  chipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  chipTextoAtivo: {
    color: '#fff',
    fontWeight: '700',
  },
});
