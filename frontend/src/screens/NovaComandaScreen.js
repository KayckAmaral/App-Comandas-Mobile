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
  Keyboard,
  TouchableWithoutFeedback,
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

export default function NovaComandaScreen({ navigation }) {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [tipoVenda, setTipoVenda] = useState('vista');
  const [itens, setItens] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [clientesRes, produtosRes] = await Promise.all([
        api.get('/clientes'),
        api.get('/produtos?ativo=true'),
      ]);

      setClientes(clientesRes.data.data);
      setProdutos(produtosRes.data.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  }

  function adicionarItem() {
    if (!produtoSelecionado) {
      Alert.alert('Atenção', 'Selecione um produto');
      return;
    }

    const qtd = parseInt(quantidade);
    if (isNaN(qtd) || qtd < 1) {
      Alert.alert('Atenção', 'Quantidade inválida');
      return;
    }

    const produto = produtos.find((p) => p.id === parseInt(produtoSelecionado));
    
    if (!produto) return;

    if (produto.quantidade_estoque < qtd) {
      Alert.alert(
        'Estoque Insuficiente',
        `Disponível: ${produto.quantidade_estoque} unidades`
      );
      return;
    }

    // Verificar se produto já está na lista
    const itemExistente = itens.find((i) => i.produto_id === produto.id);
    
    if (itemExistente) {
      setItens(
        itens.map((i) =>
          i.produto_id === produto.id
            ? { ...i, quantidade: i.quantidade + qtd }
            : i
        )
      );
    } else {
      setItens([
        ...itens,
        {
          produto_id: produto.id,
          nome: produto.nome,
          preco: Number(produto.preco),
          quantidade: qtd,
        },
      ]);
    }

    // Resetar campos
    setProdutoSelecionado('');
    setQuantidade('1');
  }

  function removerItem(produto_id) {
    setItens(itens.filter((i) => i.produto_id !== produto_id));
  }

  function calcularTotal() {
    return itens.reduce((total, item) => total + item.preco * item.quantidade, 0);
  }

  async function criarComanda() {
    if (itens.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um item à comanda');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        cliente_id: clienteSelecionado || null,
        tipo_venda: tipoVenda,
        observacoes: observacoes.trim() || null,
        itens: itens.map((item) => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
        })),
      };

      await api.post('/comandas', payload);

      // Limpa o formulário imediatamente para não persistir caso a tela
      // continue montada (ex: usuário fecha o alert tocando fora dele).
      setItens([]);
      setClienteSelecionado('');
      setTipoVenda('vista');
      setObservacoes('');
      setProdutoSelecionado('');
      setQuantidade('1');

      Alert.alert('Sucesso', 'Comanda criada com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            // popToTop volta para ListaComandas mesmo se houver telas
            // empilhadas — mais robusto que goBack().
            if (navigation.canGoBack()) {
              navigation.popToTop();
            }
          },
        },
      ]);
    } catch (error) {
      console.error('Erro ao criar comanda:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível criar a comanda'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações da Comanda</Text>

        <Text style={styles.label}>Cliente (opcional)</Text>
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

        <Text style={styles.label}>Observações (opcional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Observações sobre a comanda..."
          value={observacoes}
          onChangeText={setObservacoes}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Adicionar Produtos</Text>

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
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.addButton} onPress={adicionarItem}>
            <Text style={styles.addButtonText}>Adicionar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {itens.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens da Comanda</Text>

          {itens.map((item) => (
            <View key={item.produto_id} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.nome}</Text>
                <Text style={styles.itemDetails}>
                  {item.quantidade}x R$ {Number(item.preco).toFixed(2)} = R${' '}
                  {(item.quantidade * Number(item.preco)).toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => removerItem(item.produto_id)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>R$ {calcularTotal().toFixed(2)}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.createButton, saving && styles.createButtonDisabled]}
        onPress={criarComanda}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createButtonText}>Criar Comanda</Text>
        )}
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
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
  row: {
    flexDirection: 'row',
    gap: 12,
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
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  removeButton: {
    width: 30,
    height: 30,
    backgroundColor: '#f44336',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E57373',
  },
  createButton: {
    backgroundColor: '#E57373',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  createButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
