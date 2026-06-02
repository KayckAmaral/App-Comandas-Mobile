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
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function EstoqueScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isGerente = !user?.role || user?.role === 'gerente';
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [novaQuantidade, setNovaQuantidade] = useState('');
  const [atualizando, setAtualizando] = useState(false);
  const [desativando, setDesativando] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroEstoque, setFiltroEstoque] = useState('todos');

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const matchBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase());
      let matchFiltro = true;
      if (filtroEstoque === 'sem') matchFiltro = p.quantidade_estoque === 0;
      else if (filtroEstoque === 'baixo') matchFiltro = p.quantidade_estoque > 0 && p.quantidade_estoque <= p.estoque_minimo;
      else if (filtroEstoque === 'ok') matchFiltro = p.quantidade_estoque > p.estoque_minimo;
      else if (filtroEstoque === 'inativo') matchFiltro = !p.ativo;
      return matchBusca && matchFiltro;
    });
  }, [produtos, busca, filtroEstoque]);

  useFocusEffect(
    useCallback(() => {
      loadProdutos();
    }, [])
  );

  async function loadProdutos() {
    try {
      const response = await api.get('/produtos');
      setProdutos(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os produtos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadProdutos();
  }

  function abrirModalAtualizacao(produto) {
    setProdutoSelecionado(produto);
    setNovaQuantidade(produto.quantidade_estoque.toString());
    setModalVisible(true);
  }

  function fecharModal() {
    setModalVisible(false);
    setProdutoSelecionado(null);
    setNovaQuantidade('');
  }

  async function atualizarEstoque() {
    const qtd = parseInt(novaQuantidade);

    if (isNaN(qtd) || qtd < 0) {
      Alert.alert('Erro', 'Quantidade inválida');
      return;
    }

    setAtualizando(true);

    try {
      await api.patch(`/produtos/${produtoSelecionado.id}/estoque`, {
        quantidade_estoque: qtd,
      });

      Alert.alert('Sucesso', 'Estoque atualizado com sucesso!');
      fecharModal();
      loadProdutos();
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível atualizar o estoque'
      );
    } finally {
      setAtualizando(false);
    }
  }

  async function toggleAtivo() {
    const novoAtivo = !produtoSelecionado.ativo;
    const acao = novoAtivo ? 'reativar' : 'desativar';
    Alert.alert(
      novoAtivo ? 'Reativar Produto' : 'Desativar Produto',
      `Deseja ${acao} "${produtoSelecionado.nome}"?${!novoAtivo ? ' Ele não aparecerá nas novas comandas.' : ''}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: novoAtivo ? 'Reativar' : 'Desativar',
          style: novoAtivo ? 'default' : 'destructive',
          onPress: async () => {
            setDesativando(true);
            try {
              await api.put(`/produtos/${produtoSelecionado.id}`, { ativo: novoAtivo });
              fecharModal();
              loadProdutos();
            } catch (error) {
              Alert.alert('Erro', error.response?.data?.message || `Não foi possível ${acao} o produto`);
            } finally {
              setDesativando(false);
            }
          },
        },
      ]
    );
  }

  function getEstoqueStatus(produto) {
    if (!produto.ativo) {
      return { color: '#9E9E9E', label: 'INATIVO' };
    } else if (produto.quantidade_estoque === 0) {
      return { color: '#f44336', label: 'SEM ESTOQUE' };
    } else if (produto.quantidade_estoque <= produto.estoque_minimo) {
      return { color: '#FF9800', label: 'ESTOQUE BAIXO' };
    } else {
      return { color: '#4CAF50', label: 'OK' };
    }
  }

  function renderProduto({ item }) {
    const status = getEstoqueStatus(item);

    return (
      <TouchableOpacity
        style={styles.produtoCard}
        onPress={() => abrirModalAtualizacao(item)}
      >
        <View style={styles.produtoHeader}>
          <Text style={styles.produtoNome}>{item.nome}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
        </View>

        {item.descricao && (
          <Text style={styles.produtoDescricao}>{item.descricao}</Text>
        )}

        <View style={styles.produtoInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Disponível:</Text>
            <Text style={[styles.infoValue, { color: status.color }]}>
              {item.quantidade_estoque} un
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Mínimo:</Text>
            <Text style={styles.infoValue}>{item.estoque_minimo} un</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Preço:</Text>
            <Text style={styles.infoValue}>R$ {Number(item.preco).toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.atualizarText}>✏️ Atualizar</Text>
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
        <Text style={styles.headerTitle}>Gerenciar Estoque</Text>
        <Text style={styles.headerSubtitle}>{produtosFiltrados.length} de {produtos.length} produtos</Text>
      </View>

      <View style={styles.filtrosContainer}>
        <TextInput
          style={styles.buscaInput}
          placeholder="Buscar produto..."
          value={busca}
          onChangeText={setBusca}
          clearButtonMode="while-editing"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { label: 'Todos', value: 'todos' },
            { label: 'OK', value: 'ok' },
            { label: 'Baixo', value: 'baixo' },
            { label: 'Sem Estoque', value: 'sem' },
            { label: 'Inativos', value: 'inativo' },
          ].map((chip) => (
            <TouchableOpacity
              key={chip.value}
              style={[styles.chip, filtroEstoque === chip.value && styles.chipAtivo]}
              onPress={() => setFiltroEstoque(chip.value)}
            >
              <Text style={[styles.chipText, filtroEstoque === chip.value && styles.chipTextoAtivo]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={produtosFiltrados}
        renderItem={renderProduto}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Modal de Atualização */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={fecharModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Atualizar Estoque</Text>

            {produtoSelecionado && (
              <>
                <Text style={styles.modalProduto}>{produtoSelecionado.nome}</Text>

                <Text style={styles.modalLabel}>Estoque Atual:</Text>
                <Text style={styles.modalValorAtual}>
                  {produtoSelecionado.quantidade_estoque} unidades
                </Text>

                <Text style={styles.modalLabel}>Nova Quantidade:</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Digite a nova quantidade"
                  value={novaQuantidade}
                  onChangeText={setNovaQuantidade}
                  keyboardType="numeric"
                  autoFocus
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={fecharModal}
                    disabled={atualizando || desativando}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={atualizarEstoque}
                    disabled={atualizando || desativando}
                  >
                    {atualizando ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Atualizar</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {isGerente && (
                  <TouchableOpacity
                    style={[
                      styles.toggleAtivoButton,
                      produtoSelecionado.ativo ? styles.desativarButton : styles.reativarButton,
                      desativando && styles.buttonDisabled,
                    ]}
                    onPress={toggleAtivo}
                    disabled={atualizando || desativando}
                  >
                    {desativando ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.toggleAtivoText}>
                        {produtoSelecionado.ativo ? 'Desativar Produto' : 'Reativar Produto'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 20,
  },
  produtoCard: {
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
  produtoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  produtoNome: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  produtoDescricao: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  produtoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  atualizarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#E53935',
    textAlign: 'center',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalProduto: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalValorAtual: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#E53935',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  toggleAtivoButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  desativarButton: {
    backgroundColor: '#FF9800',
  },
  reativarButton: {
    backgroundColor: '#4CAF50',
  },
  toggleAtivoText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
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
