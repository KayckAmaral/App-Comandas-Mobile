import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert, TextInput,
  Modal, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';

const FORM_VAZIO = { nome: '', telefone: '', cpf: '' };

export default function ClientesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busca, setBusca] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [saving, setSaving] = useState(false);

  const clientesFiltrados = useMemo(() => {
    if (!busca.trim()) return clientes;
    const t = busca.toLowerCase();
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(t) ||
        (c.telefone && c.telefone.includes(busca)) ||
        (c.cpf && c.cpf.includes(busca))
    );
  }, [clientes, busca]);

  useFocusEffect(
    useCallback(() => {
      loadClientes();
    }, [])
  );

  async function loadClientes() {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data.data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os clientes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function abrirNovo() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setModalVisible(true);
  }

  function abrirEdicao(cliente) {
    setEditando(cliente);
    setForm({ nome: cliente.nome, telefone: cliente.telefone || '', cpf: cliente.cpf || '' });
    setModalVisible(true);
  }

  function fecharModal() {
    setModalVisible(false);
    setEditando(null);
    setForm(FORM_VAZIO);
  }

  async function salvar() {
    if (!form.nome.trim()) {
      Alert.alert('Atenção', 'Nome é obrigatório');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nome: form.nome.trim(),
        telefone: form.telefone.trim() || null,
        cpf: form.cpf.trim() || null,
      };
      if (editando) {
        await api.put(`/clientes/${editando.id}`, payload);
      } else {
        await api.post('/clientes', payload);
      }
      fecharModal();
      loadClientes();
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível salvar');
    } finally {
      setSaving(false);
    }
  }

  function renderCliente({ item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DetalhesCliente', { clienteId: item.id })}
        activeOpacity={0.85}
      >
        <View style={styles.cardBody}>
          <Text style={styles.cardNome}>{item.nome}</Text>
          <View style={styles.cardInfoRow}>
            {item.telefone ? (
              <Text style={styles.cardInfo}>📞 {item.telefone}</Text>
            ) : null}
            {item.cpf ? (
              <Text style={styles.cardInfo}>🪪 {item.cpf}</Text>
            ) : null}
            {!item.telefone && !item.cpf ? (
              <Text style={styles.cardInfoVazio}>Sem contato cadastrado</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.cardAcoes}>
          <TouchableOpacity style={styles.editarBtn} onPress={() => abrirEdicao(item)}>
            <Text style={styles.editarBtnText}>✏️ Editar</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.headerTitle}>Clientes</Text>
        <TouchableOpacity style={styles.novoBtn} onPress={abrirNovo}>
          <Text style={styles.novoBtnText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buscaContainer}>
        <TextInput
          style={styles.buscaInput}
          placeholder="Buscar por nome, telefone ou CPF..."
          value={busca}
          onChangeText={setBusca}
          clearButtonMode="while-editing"
        />
      </View>

      {clientesFiltrados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>{busca ? '🔍' : '👥'}</Text>
          <Text style={styles.emptyMessage}>
            {busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </Text>
          {!busca && (
            <TouchableOpacity style={styles.emptyButton} onPress={abrirNovo}>
              <Text style={styles.emptyButtonText}>Cadastrar primeiro cliente</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={clientesFiltrados}
          renderItem={renderCliente}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadClientes(); }} />}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={fecharModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>
              {editando ? 'Editar Cliente' : 'Novo Cliente'}
            </Text>

            <Text style={styles.formLabel}>Nome <Text style={styles.obrigatorio}>*</Text></Text>
            <TextInput
              style={styles.formInput}
              placeholder="Nome completo"
              value={form.nome}
              onChangeText={(v) => setForm((f) => ({ ...f, nome: v }))}
              autoFocus
            />

            <Text style={styles.formLabel}>Telefone</Text>
            <TextInput
              style={styles.formInput}
              placeholder="(00) 00000-0000"
              value={form.telefone}
              onChangeText={(v) => setForm((f) => ({ ...f, telefone: v }))}
              keyboardType="phone-pad"
            />

            <Text style={styles.formLabel}>CPF</Text>
            <TextInput
              style={styles.formInput}
              placeholder="000.000.000-00"
              value={form.cpf}
              onChangeText={(v) => setForm((f) => ({ ...f, cpf: v }))}
              keyboardType="numeric"
            />

            <View style={styles.modalBotoes}>
              <TouchableOpacity style={styles.cancelarBtn} onPress={fecharModal} disabled={saving}>
                <Text style={styles.cancelarBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.salvarBtn, saving && styles.btnDisabled]} onPress={salvar} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.salvarBtnText}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  novoBtn: { backgroundColor: '#E53935', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  novoBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  buscaContainer: {
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
  },
  buscaInput: {
    backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e0e0e0',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14,
  },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  cardBody: { marginBottom: 10 },
  cardNome: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  cardInfoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cardInfo: { fontSize: 13, color: '#666' },
  cardInfoVazio: { fontSize: 13, color: '#bbb', fontStyle: 'italic' },
  cardAcoes: { flexDirection: 'row', justifyContent: 'flex-end' },
  editarBtn: { backgroundColor: '#E53935', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  editarBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyMessage: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  emptyButton: { backgroundColor: '#E53935', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  emptyButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  formLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  obrigatorio: { color: '#E53935' },
  formInput: {
    backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, padding: 12, fontSize: 15,
  },
  modalBotoes: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelarBtn: {
    flex: 1, padding: 14, borderRadius: 8, alignItems: 'center',
    backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ddd',
  },
  cancelarBtnText: { color: '#666', fontWeight: '600' },
  salvarBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: '#E53935' },
  salvarBtnText: { color: '#fff', fontWeight: 'bold' },
  btnDisabled: { backgroundColor: '#9E9E9E' },
});
