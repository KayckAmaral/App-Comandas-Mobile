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

function SelectField({ label, value, items, placeholder, onChange, searchable = false }) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const selected = items.find((i) => String(i.value) === String(value));

  function fechar() {
    setOpen(false);
    setBusca('');
  }

  const itensFiltrados =
    searchable && busca.trim()
      ? items.filter((i) => i.label.toLowerCase().includes(busca.toLowerCase()))
      : items;

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
        onRequestClose={fechar}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={fechar}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={fechar}>
                  <Text style={styles.modalClose}>Fechar</Text>
                </TouchableOpacity>
              </View>
              {searchable && (
                <View style={styles.modalSearchContainer}>
                  <TextInput
                    style={styles.modalSearchInput}
                    placeholder="Buscar cliente..."
                    value={busca}
                    onChangeText={setBusca}
                    clearButtonMode="while-editing"
                    autoFocus
                  />
                </View>
              )}
              <FlatList
                data={itensFiltrados}
                keyExtractor={(it) => String(it.value)}
                ListEmptyComponent={
                  <Text style={styles.modalSemResultados}>Nenhum cliente encontrado</Text>
                }
                renderItem={({ item }) => {
                  const isSelected = String(value) === String(item.value);
                  return (
                    <TouchableOpacity
                      style={[styles.option, isSelected && styles.optionSelected]}
                      onPress={() => {
                        onChange(item.value);
                        fechar();
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
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

function ProdutoPicker({ value, produtos, categorias, onChange }) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

  const produtoSel = produtos.find((p) => String(p.id) === String(value));

  function fechar() {
    setOpen(false);
    setBusca('');
    setCategoriaFiltro('');
  }

  const produtosFiltrados = produtos.filter((p) => {
    const matchBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase());
    const matchCat = !categoriaFiltro || String(p.categoria_id) === categoriaFiltro;
    return matchBusca && matchCat;
  });

  return (
    <>
      <TouchableOpacity style={styles.selectButton} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={[styles.selectButtonText, !produtoSel && styles.selectButtonPlaceholder]} numberOfLines={1}>
          {produtoSel
            ? `${produtoSel.nome} — R$ ${Number(produtoSel.preco).toFixed(2)}`
            : 'Selecione um produto'}
        </Text>
        <Text style={styles.selectButtonChevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={fechar}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={fechar} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecionar Produto</Text>
                <TouchableOpacity onPress={fechar}>
                  <Text style={styles.modalClose}>Fechar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalSearchContainer}>
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Buscar produto..."
                  value={busca}
                  onChangeText={setBusca}
                  clearButtonMode="while-editing"
                  autoFocus
                />
              </View>
              {categorias.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.pickerCategorias}
                  contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
                >
                  <TouchableOpacity
                    style={[styles.pickerCategoriaChip, !categoriaFiltro && styles.pickerCategoriaChipAtivo]}
                    onPress={() => setCategoriaFiltro('')}
                  >
                    <Text style={[styles.pickerCategoriaChipText, !categoriaFiltro && styles.pickerCategoriaChipTextoAtivo]}>
                      Todas
                    </Text>
                  </TouchableOpacity>
                  {categorias.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.pickerCategoriaChip, categoriaFiltro === String(cat.id) && styles.pickerCategoriaChipAtivo]}
                      onPress={() => setCategoriaFiltro(String(cat.id))}
                    >
                      <Text style={[styles.pickerCategoriaChipText, categoriaFiltro === String(cat.id) && styles.pickerCategoriaChipTextoAtivo]}>
                        {cat.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              <FlatList
                data={produtosFiltrados}
                keyExtractor={(p) => String(p.id)}
                ListEmptyComponent={<Text style={styles.modalSemResultados}>Nenhum produto encontrado</Text>}
                renderItem={({ item }) => {
                  const isSelected = String(value) === String(item.id);
                  const semEstoque = item.quantidade_estoque === 0;
                  return (
                    <TouchableOpacity
                      style={[styles.option, isSelected && styles.optionSelected, semEstoque && styles.optionDesabilitada]}
                      onPress={() => { if (!semEstoque) { onChange(item.id.toString()); fechar(); } }}
                      disabled={semEstoque}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected, semEstoque && styles.optionTextDesabilitada]}>
                          {item.nome}
                        </Text>
                        <Text style={styles.optionSubtext}>
                          R$ {Number(item.preco).toFixed(2)} • Est: {item.quantidade_estoque}
                          {item.categoria_nome ? ` • ${item.categoria_nome}` : ''}
                        </Text>
                      </View>
                      {isSelected && !semEstoque && <Text style={styles.optionCheck}>✓</Text>}
                      {semEstoque && <Text style={styles.pickerSemEstoqueTag}>Esgotado</Text>}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

export default function NovaComandaScreen({ navigation }) {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [tipoVenda, setTipoVenda] = useState('vista');
  const [mesa, setMesa] = useState('');
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
      const [clientesRes, produtosRes, categoriasRes] = await Promise.all([
        api.get('/clientes'),
        api.get('/produtos?ativo=true'),
        api.get('/categorias'),
      ]);

      setClientes(clientesRes.data.data);
      setProdutos(produtosRes.data.data);
      setCategorias(categoriasRes.data.data);
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

    const qtd = parseInt(quantidade, 10);
    if (isNaN(qtd) || qtd < 1) {
      Alert.alert('Atenção', 'Informe uma quantidade válida');
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

    if (!mesa.trim()) {
      Alert.alert('Atenção', 'Informe a mesa, balcão ou tipo de atendimento');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        cliente_id: clienteSelecionado || null,
        tipo_venda: tipoVenda,
        mesa: mesa.trim() || null,
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
      setMesa('');
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
          searchable
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

        <Text style={styles.label}>Mesa / Local <Text style={{ color: '#E57373' }}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Mesa 5, Balcão, Delivery..."
          value={mesa}
          onChangeText={setMesa}
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
        <ProdutoPicker
          value={produtoSelecionado}
          produtos={produtos}
          categorias={categorias}
          onChange={setProdutoSelecionado}
        />

        <Text style={styles.label}>Quantidade</Text>
        <View style={styles.row}>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setQuantidade((q) => String(Math.max(1, parseInt(q, 10) - 1 || 1)))}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.stepperValue}
              value={quantidade}
              onChangeText={setQuantidade}
              keyboardType="numeric"
              textAlign="center"
              selectTextOnFocus
            />
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setQuantidade((q) => String((parseInt(q, 10) || 0) + 1))}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
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
    borderRadius: 16,
    maxHeight: '75%',
    minHeight: 360,
    marginHorizontal: 0,
    marginBottom: 20,
    paddingBottom: 16,
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
  modalSearchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalSearchInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  modalSemResultados: {
    textAlign: 'center',
    color: '#999',
    padding: 24,
    fontStyle: 'italic',
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
    alignItems: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 44,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  stepperBtnText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 26,
  },
  stepperValue: {
    minWidth: 48,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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
  pickerCategorias: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerCategoriaChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  pickerCategoriaChipAtivo: {
    backgroundColor: '#E57373',
    borderColor: '#E57373',
  },
  pickerCategoriaChipText: {
    fontSize: 12,
    color: '#666',
  },
  pickerCategoriaChipTextoAtivo: {
    color: '#fff',
    fontWeight: '700',
  },
  optionSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  optionDesabilitada: {
    opacity: 0.45,
  },
  optionTextDesabilitada: {
    color: '#bbb',
  },
  pickerSemEstoqueTag: {
    fontSize: 11,
    color: '#f44336',
    fontWeight: '600',
    marginLeft: 8,
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
