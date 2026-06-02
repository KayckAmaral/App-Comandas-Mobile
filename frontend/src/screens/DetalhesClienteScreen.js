import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

function getStatusColor(status) {
  switch (status) {
    case 'aberta': return '#4CAF50';
    case 'fechada': return '#2196F3';
    case 'cancelada': return '#f44336';
    default: return '#9E9E9E';
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function DetalhesClienteScreen({ route, navigation }) {
  const { clienteId } = route.params;
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form, setForm] = useState({ nome: '', telefone: '', cpf: '' });
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadDados();
    }, [])
  );

  async function loadDados() {
    try {
      const res = await api.get(`/clientes/${clienteId}/historico`);
      setDados(res.data.data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os dados do cliente');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  function abrirEdicao() {
    setForm({
      nome: dados.cliente.nome,
      telefone: dados.cliente.telefone || '',
      cpf: dados.cliente.cpf || '',
    });
    setEditModalVisible(true);
  }

  async function salvar() {
    if (!form.nome.trim()) {
      Alert.alert('Atenção', 'Nome é obrigatório');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/clientes/${clienteId}`, {
        nome: form.nome.trim(),
        telefone: form.telefone.trim() || null,
        cpf: form.cpf.trim() || null,
      });
      setEditModalVisible(false);
      loadDados();
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível salvar');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !dados) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  const { cliente, comandas, fiado } = dados;
  const fiadoAberto = comandas.filter(c => c.tipo_venda === 'fiado' && c.status === 'aberta');

  return (
    <ScrollView style={styles.container}>
      {/* Dados do cliente */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dados do Cliente</Text>
          <TouchableOpacity style={styles.editBtn} onPress={abrirEdicao}>
            <Text style={styles.editBtnText}>✏️ Editar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nome:</Text>
          <Text style={styles.infoValue}>{cliente.nome}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Telefone:</Text>
          <Text style={styles.infoValue}>{cliente.telefone || '—'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>CPF:</Text>
          <Text style={styles.infoValue}>{cliente.cpf || '—'}</Text>
        </View>
      </View>

      {/* Controle de Fiado */}
      {fiado.quantidade > 0 && (
        <View style={[styles.section, styles.fiadoSection]}>
          <Text style={styles.fiadoTitulo}>⚠️ Fiado em Aberto</Text>
          <Text style={styles.fiadoQtd}>
            {fiado.quantidade} comanda{fiado.quantidade > 1 ? 's' : ''} não paga{fiado.quantidade > 1 ? 's' : ''}
          </Text>
          <Text style={styles.fiadoTotal}>
            Total: R$ {Number(fiado.total).toFixed(2)}
          </Text>
          <Text style={styles.fiadoAviso}>
            Pagamentos são registrados pelo sistema do caixa.
          </Text>
          {fiadoAberto.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.fiadoComandaCard}
              onPress={() => navigation.navigate('Comandas', {
                screen: 'DetalhesComanda',
                params: { comandaId: c.id },
              })}
            >
              <View>
                <Text style={styles.fiadoComandaMesa}>{c.mesa || `#${c.id}`}</Text>
                <Text style={styles.fiadoComandaData}>{formatDate(c.data_abertura)}</Text>
              </View>
              <Text style={styles.fiadoComandaTotal}>R$ {Number(c.valor_total).toFixed(2)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Histórico */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Histórico de Comandas ({comandas.length})
        </Text>

        {comandas.length === 0 ? (
          <Text style={styles.semHistorico}>Nenhuma comanda registrada</Text>
        ) : (
          comandas.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.historicCard}
              onPress={() => navigation.navigate('Comandas', {
                screen: 'DetalhesComanda',
                params: { comandaId: c.id },
              })}
            >
              <View style={styles.historicLeft}>
                <Text style={styles.historicMesa}>{c.mesa || `#${c.id}`}</Text>
                <Text style={styles.historicData}>{formatDate(c.data_abertura)}</Text>
                <Text style={styles.historicTipo}>
                  {c.tipo_venda === 'vista' ? 'À Vista' : 'Fiado'}
                </Text>
              </View>
              <View style={styles.historicRight}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(c.status) }]}>
                  <Text style={styles.statusText}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </Text>
                </View>
                <Text style={styles.historicTotal}>R$ {Number(c.valor_total).toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={{ height: 40 }} />

      {/* Modal de edição */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Editar Cliente</Text>

            <Text style={styles.formLabel}>Nome <Text style={{ color: '#E53935' }}>*</Text></Text>
            <TextInput
              style={styles.formInput}
              value={form.nome}
              onChangeText={(v) => setForm((f) => ({ ...f, nome: v }))}
              autoFocus
            />

            <Text style={styles.formLabel}>Telefone</Text>
            <TextInput
              style={styles.formInput}
              value={form.telefone}
              onChangeText={(v) => setForm((f) => ({ ...f, telefone: v }))}
              keyboardType="phone-pad"
            />

            <Text style={styles.formLabel}>CPF</Text>
            <TextInput
              style={styles.formInput}
              value={form.cpf}
              onChangeText={(v) => setForm((f) => ({ ...f, cpf: v }))}
              keyboardType="numeric"
            />

            <View style={styles.modalBotoes}>
              <TouchableOpacity style={styles.cancelarBtn} onPress={() => setEditModalVisible(false)} disabled={saving}>
                <Text style={styles.cancelarBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.salvarBtn, saving && styles.btnDisabled]} onPress={salvar} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.salvarBtnText}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { backgroundColor: '#fff', padding: 20, marginTop: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  editBtn: { backgroundColor: '#E53935', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  infoRow: { flexDirection: 'row', marginBottom: 10 },
  infoLabel: { fontSize: 14, color: '#888', width: 80 },
  infoValue: { flex: 1, fontSize: 14, color: '#333', fontWeight: '500' },
  fiadoSection: { backgroundColor: '#FFF3E0', borderLeftWidth: 4, borderLeftColor: '#FF9800' },
  fiadoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#E65100', marginBottom: 6 },
  fiadoQtd: { fontSize: 14, color: '#E65100', marginBottom: 2 },
  fiadoTotal: { fontSize: 20, fontWeight: 'bold', color: '#E65100', marginBottom: 4 },
  fiadoAviso: { fontSize: 12, color: '#999', fontStyle: 'italic', marginBottom: 12 },
  fiadoComandaCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 8, padding: 12, marginTop: 8,
  },
  fiadoComandaMesa: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  fiadoComandaData: { fontSize: 12, color: '#999', marginTop: 2 },
  fiadoComandaTotal: { fontSize: 16, fontWeight: 'bold', color: '#FF9800' },
  semHistorico: { fontSize: 14, color: '#999', fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },
  historicCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  historicLeft: { flex: 1 },
  historicMesa: { fontSize: 15, fontWeight: '600', color: '#333' },
  historicData: { fontSize: 12, color: '#999', marginTop: 2 },
  historicTipo: { fontSize: 12, color: '#888', marginTop: 2 },
  historicRight: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  historicTotal: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  formLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
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
