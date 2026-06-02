import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Modal, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';

const PERIODOS = [
  { key: 'hoje', label: 'Hoje' },
  { key: '7dias', label: '7 dias' },
  { key: 'mes', label: 'Este mês' },
  { key: 'custom', label: 'Personalizado' },
];

function fmtMoeda(v) {
  return `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;
}

function fmtDataBtn(date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtDataExib(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function DatePickerModal({ visible, value, onChange, onClose, minimumDate, maximumDate }) {
  const [tempDate, setTempDate] = useState(value);

  if (!visible) return null;

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={value}
        mode="date"
        display="default"
        onChange={(event, date) => {
          onClose();
          if (event.type !== 'dismissed' && date) onChange(date);
        }}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    );
  }

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={pickerStyles.overlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={pickerStyles.sheet}>
          <View style={pickerStyles.toolbar}>
            <TouchableOpacity onPress={onClose}>
              <Text style={pickerStyles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onChange(tempDate); onClose(); }}>
              <Text style={pickerStyles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            onChange={(_, date) => { if (date) setTempDate(date); }}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            locale="pt-BR"
          />
        </View>
      </View>
    </Modal>
  );
}

const hoje = new Date();

export default function RelatoriosScreen() {
  const insets = useSafeAreaInsets();
  const [periodo, setPeriodo] = useState('mes');
  const [dateInicio, setDateInicio] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [dateFim, setDateFim] = useState(hoje);
  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFim, setShowPickerFim] = useState(false);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (periodo !== 'custom') buscarRelatorio();
  }, [periodo]);

  function getDatas() {
    const fmt = (d) => d.toISOString().split('T')[0];
    if (periodo === 'hoje') return { inicio: fmt(hoje), fim: fmt(hoje) };
    if (periodo === '7dias') {
      const s = new Date(hoje); s.setDate(hoje.getDate() - 6);
      return { inicio: fmt(s), fim: fmt(hoje) };
    }
    if (periodo === 'mes') {
      return { inicio: fmt(new Date(hoje.getFullYear(), hoje.getMonth(), 1)), fim: fmt(hoje) };
    }
    if (periodo === 'custom') {
      return { inicio: fmt(dateInicio), fim: fmt(dateFim) };
    }
    return null;
  }

  async function buscarRelatorio() {
    const datas = getDatas();
    if (!datas) return;
    setLoading(true);
    try {
      const res = await api.get('/comandas/relatorios', {
        params: { data_inicio: datas.inicio, data_fim: datas.fim },
      });
      setDados(res.data.data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os relatórios');
    } finally {
      setLoading(false);
    }
  }

  function getStatusCount(status) {
    if (!dados) return 0;
    const found = dados.por_status.find((s) => s.status === status);
    return found ? found.total : 0;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Relatórios</Text>
      </View>

      {/* Seletor de período */}
      <View style={styles.section}>
        <View style={styles.periodoRow}>
          {PERIODOS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.periodoChip, periodo === p.key && styles.periodoChipAtivo]}
              onPress={() => setPeriodo(p.key)}
            >
              <Text style={[styles.periodoChipText, periodo === p.key && styles.periodoChipTextoAtivo]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {periodo === 'custom' && (
          <View style={styles.customRow}>
            <View style={styles.customField}>
              <Text style={styles.customLabel}>De</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPickerInicio(true)}>
                <Text style={styles.dateBtnText}>📅 {fmtDataBtn(dateInicio)}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.customField}>
              <Text style={styles.customLabel}>Até</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPickerFim(true)}>
                <Text style={styles.dateBtnText}>📅 {fmtDataBtn(dateFim)}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.buscarBtn} onPress={buscarRelatorio}>
              <Text style={styles.buscarBtnText}>Buscar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53935" />
        </View>
      ) : dados ? (
        <>
          <Text style={styles.periodoLabel}>
            {fmtDataExib(dados.periodo.inicio)}
            {dados.periodo.inicio !== dados.periodo.fim ? ` até ${fmtDataExib(dados.periodo.fim)}` : ''}
          </Text>

          <View style={styles.resumoRow}>
            <View style={[styles.resumoCard, { borderTopColor: '#E53935' }]}>
              <Text style={styles.resumoValor}>{fmtMoeda(dados.resumo.faturamento)}</Text>
              <Text style={styles.resumoLabel}>Faturamento</Text>
            </View>
            <View style={[styles.resumoCard, { borderTopColor: '#2196F3' }]}>
              <Text style={styles.resumoValor}>{fmtMoeda(dados.resumo.ticket_medio)}</Text>
              <Text style={styles.resumoLabel}>Ticket Médio</Text>
            </View>
            <View style={[styles.resumoCard, { borderTopColor: '#4CAF50' }]}>
              <Text style={styles.resumoValor}>{dados.resumo.total_fechadas}</Text>
              <Text style={styles.resumoLabel}>Fechadas</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pedidos no Período</Text>
            <View style={styles.statusRow}>
              {[
                { key: 'aberta', label: 'Abertas', color: '#4CAF50' },
                { key: 'fechada', label: 'Fechadas', color: '#2196F3' },
                { key: 'cancelada', label: 'Canceladas', color: '#f44336' },
              ].map((s) => (
                <View key={s.key} style={styles.statusCard}>
                  <Text style={[styles.statusNumero, { color: s.color }]}>{getStatusCount(s.key)}</Text>
                  <Text style={styles.statusLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Produtos Mais Vendidos</Text>
            {dados.top_produtos.length === 0 ? (
              <Text style={styles.semDados}>Nenhuma venda no período</Text>
            ) : (
              dados.top_produtos.map((p, i) => (
                <View key={i} style={styles.produtoRow}>
                  <View style={styles.produtoRank}>
                    <Text style={styles.produtoRankNum}>{i + 1}</Text>
                  </View>
                  <Text style={styles.produtoNome} numberOfLines={1}>{p.nome}</Text>
                  <View style={styles.produtoNums}>
                    <Text style={styles.produtoQtd}>{p.total_vendido}x</Text>
                    <Text style={styles.produtoReceita}>{fmtMoeda(p.receita)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      ) : null}

      <View style={{ height: 40 }} />

      {/* Date Pickers */}
      <DatePickerModal
        visible={showPickerInicio}
        value={dateInicio}
        onChange={(date) => setDateInicio(date)}
        onClose={() => setShowPickerInicio(false)}
        maximumDate={dateFim}
      />
      <DatePickerModal
        visible={showPickerFim}
        value={dateFim}
        onChange={(date) => setDateFim(date)}
        onClose={() => setShowPickerFim(false)}
        minimumDate={dateInicio}
        maximumDate={new Date()}
      />
    </ScrollView>
  );
}

const pickerStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  toolbar: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  cancelText: { fontSize: 16, color: '#666' },
  confirmText: { fontSize: 16, color: '#E53935', fontWeight: 'bold' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    padding: 20, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  section: { backgroundColor: '#fff', padding: 20, marginTop: 12 },
  periodoRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  periodoChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff',
  },
  periodoChipAtivo: { backgroundColor: '#E53935', borderColor: '#E53935' },
  periodoChipText: { fontSize: 13, color: '#666', fontWeight: '500' },
  periodoChipTextoAtivo: { color: '#fff', fontWeight: '700' },
  customRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 16 },
  customField: { flex: 1 },
  customLabel: { fontSize: 12, color: '#888', marginBottom: 6 },
  dateBtn: {
    backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, padding: 10,
  },
  dateBtnText: { fontSize: 13, color: '#333', fontWeight: '500' },
  buscarBtn: {
    backgroundColor: '#E53935', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  buscarBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  loadingContainer: { paddingVertical: 60, alignItems: 'center' },
  periodoLabel: { textAlign: 'center', fontSize: 13, color: '#888', marginTop: 12, marginBottom: 4 },
  resumoRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  resumoCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14,
    alignItems: 'center', borderTopWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 3, elevation: 2,
  },
  resumoValor: { fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  resumoLabel: { fontSize: 11, color: '#888', marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 14 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statusCard: { alignItems: 'center' },
  statusNumero: { fontSize: 28, fontWeight: 'bold' },
  statusLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  semDados: { fontSize: 14, color: '#999', fontStyle: 'italic', textAlign: 'center' },
  produtoRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  produtoRank: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#E53935',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  produtoRankNum: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  produtoNome: { flex: 1, fontSize: 14, color: '#333', fontWeight: '500' },
  produtoNums: { alignItems: 'flex-end' },
  produtoQtd: { fontSize: 13, color: '#888' },
  produtoReceita: { fontSize: 13, fontWeight: 'bold', color: '#E53935' },
});
