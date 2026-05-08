import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import api from '../services/api';

function SelectField({ label, value, items, placeholder, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => String(i.value) === String(value));

  return (
    <>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectButtonText,
            !selected && styles.selectButtonPlaceholder,
          ]}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={styles.selectButtonChevron}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={styles.modalClose}>Fechar</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={items}
              keyExtractor={(it) => String(it.value)}
              renderItem={({ item }) => {
                const isSelected = String(value) === String(item.value);
                return (
                  <TouchableOpacity
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && <Text style={styles.optionCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function EditarComandaScreen({ route, navigation }) {
  const { comandaId } = route.params;

  const [comanda, setComanda] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);

  // Form de metadados
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [tipoVenda, setTipoVenda] = useState('vista');
  const [observacoes, setObservacoes] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);

  // Adicionar produto
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidadeNova, setQuantidadeNova] = useState('1');
  const [adicionando, setAdicionando] = useState(false);

  // Edição/remoção de itens
  const [editandoItemId, setEditandoItemId] = useState(null);
  const [novaQuantidade, setNovaQuantidade] = useState('');
  const [salvandoItem, setSalvandoItem] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [comandaRes, clientesRes, produtosRes] = await Promise.all([
        api.get(`/comandas/${comandaId}`),
        api.get('/clientes'),
        api.get('/produtos?ativo=true'),
      ]);

      const c = comandaRes.data.data;
      setComanda(c);
      setClientes(clientesRes.data.data);
      setProdutos(produtosRes.data.data);
      setClienteSelecionado(c.cliente_id ? String(c.cliente_id) : '');
      setTipoVenda(c.tipo_venda || 'vista');
      setObservacoes(c.observacoes || '');

      if (c.status !== 'aberta') {
        Alert.alert(
          'Comanda não editável',
          'Apenas comandas abertas podem ser editadas.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function recarregarComanda() {
    try {
      const res = await api.get(`/comandas/${comandaId}`);
      setComanda(res.data.data);
    } catch (error) {
      console.error('Erro ao recarregar comanda:', error);
    }
  }

  async function salvarMetadados() {
    setSavingMeta(true);
    try {
      await api.patch(`/comandas/${comandaId}`, {
        cliente_id: clienteSelecionado || null,
        tipo_venda: tipoVenda,
        observacoes: observacoes.trim() || null,
      });
      await recarregarComanda();
      Alert.alert('Sucesso', 'Dados da comanda atualizados');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível salvar'
      );
    } finally {
      setSavingMeta(false);
    }
  }

  async function adicionarProduto() {
    if (!produtoSelecionado) {
      Alert.alert('Atenção', 'Selecione um produto');
      return;
    }
    const qtd = parseInt(quantidadeNova, 10);
    if (isNaN(qtd) || qtd < 1) {
      Alert.alert('Atenção', 'Quantidade inválida');
      return;
    }

    setAdicionando(true);
    try {
      await api.post(`/comandas/${comandaId}/itens`, {
        produto_id: parseInt(produtoSelecionado, 10),
        quantidade: qtd,
      });
      setProdutoSelecionado('');
      setQuantidadeNova('1');
      await recarregarComanda();
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível adicionar o item'
      );
    } finally {
      setAdicionando(false);
    }
  }

  function iniciarEdicaoItem(item) {
    setEditandoItemId(item.id);
    setNovaQuantidade(String(item.quantidade));
  }

  function cancelarEdicaoItem() {
    setEditandoItemId(null);
    setNovaQuantidade('');
  }

  async function salvarQuantidadeItem(itemId) {
    const qtd = parseInt(novaQuantidade, 10);
    if (isNaN(qtd) || qtd < 1) {
      Alert.alert('Atenção', 'Quantidade inválida');
      return;
    }

    setSalvandoItem(true);
    try {
      await api.patch(`/comandas/${comandaId}/itens/${itemId}`, {
        quantidade: qtd,
      });
      cancelarEdicaoItem();
      await recarregarComanda();
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível atualizar o item'
      );
    } finally {
      setSalvandoItem(false);
    }
  }

  function confirmarRemoverItem(item) {
    Alert.alert(
      'Remover item',
      `Remover "${item.produto_nome}" da comanda? O estoque será devolvido.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removerItem(item.id),
        },
      ]
    );
  }

  async function removerItem(itemId) {
    try {
      await api.delete(`/comandas/${comandaId}/itens/${itemId}`);
      await recarregarComanda();
    } catch (error) {
      console.error('Erro ao remover item:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível remover o item'
      );
    }
  }

  if (loading || !comanda) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E57373" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {/* Metadados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>

          <Text style={styles.label}>Cliente</Text>
          <SelectField
            label="Selecione o cliente"
            value={clienteSelecionado}
            placeholder="Sem cliente"
            items={[
              { label: 'Sem cliente', value: '' },
              ...clientes.map((c) => ({ label: c.nome, value: c.id.toString() })),
            ]}
            onChange={setClienteSelecionado}
          />

          <Text style={styles.label}>Tipo de Venda</Text>
          <SelectField
            label="Tipo de venda"
            value={tipoVenda}
            placeholder="Selecione"
            items={[
              { label: 'À Vista', value: 'vista' },
              { label: 'Fiado (A Prazo)', value: 'fiado' },
            ]}
            onChange={setTipoVenda}
          />

          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Observações sobre a comanda..."
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.primaryButton, savingMeta && styles.buttonDisabled]}
            onPress={salvarMetadados}
            disabled={savingMeta}
          >
            {savingMeta ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Salvar dados</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Itens existentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens da Comanda</Text>

          {comanda.itens && comanda.itens.length > 0 ? (
            comanda.itens.map((item) => {
              const editando = editandoItemId === item.id;
              return (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemNome}>{item.produto_nome}</Text>
                    <Text style={styles.itemSubtotal}>
                      R$ {Number(item.subtotal).toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.itemPrecoUnit}>
                    R$ {Number(item.preco_unitario).toFixed(2)} cada
                  </Text>

                  {editando ? (
                    <View style={styles.editRow}>
                      <TextInput
                        style={styles.qtdInput}
                        value={novaQuantidade}
                        onChangeText={setNovaQuantidade}
                        keyboardType="numeric"
                        autoFocus
                      />
                      <TouchableOpacity
                        style={[styles.smallButton, styles.saveBtn]}
                        onPress={() => salvarQuantidadeItem(item.id)}
                        disabled={salvandoItem}
                      >
                        {salvandoItem ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.smallButtonText}>Salvar</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.smallButton, styles.cancelBtn]}
                        onPress={cancelarEdicaoItem}
                      >
                        <Text style={styles.smallButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.editRow}>
                      <Text style={styles.qtdText}>
                        Quantidade: {item.quantidade}
                      </Text>
                      <TouchableOpacity
                        style={[styles.smallButton, styles.editBtn]}
                        onPress={() => iniciarEdicaoItem(item)}
                      >
                        <Text style={styles.smallButtonText}>✏️ Altera</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.smallButton, styles.removeBtn]}
                        onPress={() => confirmarRemoverItem(item)}
                      >
                        <Text style={styles.smallButtonText}>Remover</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <Text style={styles.semItens}>Nenhum item na comanda</Text>
          )}

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              R$ {Number(comanda.valor_total).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Adicionar produto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adicionar Produto</Text>

          <Text style={styles.label}>Produto</Text>
          <SelectField
            label="Selecione um produto"
            value={produtoSelecionado}
            placeholder="Selecione um produto"
            items={produtos.map((p) => ({
              label: `${p.nome} — R$ ${Number(p.preco).toFixed(2)} (Est: ${p.quantidade_estoque})`,
              value: p.id.toString(),
            }))}
            onChange={setProdutoSelecionado}
          />

          <Text style={styles.label}>Quantidade</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="1"
              value={quantidadeNova}
              onChangeText={setQuantidadeNova}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.addButton, adicionando && styles.buttonDisabled]}
              onPress={adicionarProduto}
              disabled={adicionando}
            >
              {adicionando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.addButtonText}>Adicionar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.doneButtonText}>Concluir edição</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 50,
  },
  selectButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  selectButtonPlaceholder: {
    color: '#999',
  },
  selectButtonChevron: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClose: {
    fontSize: 14,
    color: '#E57373',
    fontWeight: '600',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  optionSelected: {
    backgroundColor: '#FCE4E4',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#E57373',
    fontWeight: '600',
  },
  optionCheck: {
    fontSize: 16,
    color: '#E57373',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  textArea: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#E57373',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  itemCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemNome: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemSubtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E57373',
    marginLeft: 8,
  },
  itemPrecoUnit: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  qtdText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  qtdInput: {
    width: 70,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  editBtn: {
    backgroundColor: '#2196F3',
  },
  removeBtn: {
    backgroundColor: '#f44336',
  },
  saveBtn: {
    backgroundColor: '#E57373',
  },
  cancelBtn: {
    backgroundColor: '#9E9E9E',
  },
  semItens: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E57373',
  },
  addButton: {
    backgroundColor: '#E57373',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
