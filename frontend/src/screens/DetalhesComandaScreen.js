import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

export default function DetalhesComandaScreen({ route, navigation }) {
  const { comandaId } = route.params;
  const [comanda, setComanda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finalizando, setFinalizando] = useState(false);

  // Recarrega ao voltar da tela de edição
  useFocusEffect(
    useCallback(() => {
      loadComanda();
    }, [])
  );

  async function loadComanda() {
    try {
      const response = await api.get(`/comandas/${comandaId}`);
      setComanda(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar comanda:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da comanda');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  async function finalizarComanda() {
    Alert.alert(
      'Finalizar Comanda',
      'Deseja realmente finalizar esta comanda? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: async () => {
            setFinalizando(true);
            try {
              await api.patch(`/comandas/${comandaId}/finalizar`);
              Alert.alert('Sucesso', 'Comanda finalizada com sucesso!', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Erro ao finalizar comanda:', error);
              Alert.alert(
                'Erro',
                error.response?.data?.message || 'Não foi possível finalizar a comanda'
              );
            } finally {
              setFinalizando(false);
            }
          },
        },
      ]
    );
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E57373" />
      </View>
    );
  }

  if (!comanda) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.comandaId}>Comanda #{comanda.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(comanda.status) }]}>
            <Text style={styles.statusText}>
              {comanda.status.charAt(0).toUpperCase() + comanda.status.slice(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.dataAbertura}>
          Aberta em: {formatDate(comanda.data_abertura)}
        </Text>

        {comanda.data_fechamento && (
          <Text style={styles.dataFechamento}>
            Fechada em: {formatDate(comanda.data_fechamento)}
          </Text>
        )}
      </View>

      {/* Informações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cliente:</Text>
          <Text style={styles.infoValue}>
            {comanda.cliente_nome || 'Sem cliente'}
          </Text>
        </View>

        {comanda.cliente_telefone && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telefone:</Text>
            <Text style={styles.infoValue}>{comanda.cliente_telefone}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Atendente:</Text>
          <Text style={styles.infoValue}>{comanda.usuario_nome}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tipo de Venda:</Text>
          <Text style={styles.infoValue}>
            {comanda.tipo_venda === 'vista' ? 'À Vista' : 'Fiado (A Prazo)'}
          </Text>
        </View>

        {comanda.observacoes && (
          <View style={styles.observacoes}>
            <Text style={styles.infoLabel}>Observações:</Text>
            <Text style={styles.observacoesText}>{comanda.observacoes}</Text>
          </View>
        )}
      </View>

      {/* Itens */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Itens do Pedido</Text>

        {comanda.itens && comanda.itens.length > 0 ? (
          comanda.itens.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemNome}>{item.produto_nome}</Text>
                <Text style={styles.itemSubtotal}>
                  R$ {Number(item.subtotal).toFixed(2)}
                </Text>
              </View>

              {item.produto_descricao && (
                <Text style={styles.itemDescricao}>{item.produto_descricao}</Text>
              )}

              <Text style={styles.itemDetalhes}>
                {item.quantidade}x R$ {Number(item.preco_unitario).toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.semItens}>Nenhum item na comanda</Text>
        )}
      </View>

      {/* Total */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Valor Total</Text>
        <Text style={styles.totalValue}>
          R$ {Number(comanda.valor_total).toFixed(2)}
        </Text>
      </View>

      {/* Botões de ação (apenas quando aberta) */}
      {comanda.status === 'aberta' && (
        <>
          <TouchableOpacity
            style={styles.editarButton}
            onPress={() =>
              navigation.navigate('EditarComanda', { comandaId: comanda.id })
            }
          >
            <Text style={styles.editarButtonText}>Editar Comanda</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.finalizarButton, finalizando && styles.buttonDisabled]}
            onPress={finalizarComanda}
            disabled={finalizando}
          >
            {finalizando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.finalizarButtonText}>Finalizar Comanda</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      <View style={{ height: 40 }} />
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
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  comandaId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dataAbertura: {
    fontSize: 14,
    color: '#666',
  },
  dataFechamento: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  observacoes: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  observacoesText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    fontStyle: 'italic',
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
    alignItems: 'flex-start',
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
  itemDescricao: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  itemDetalhes: {
    fontSize: 13,
    color: '#999',
  },
  semItens: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  totalContainer: {
    backgroundColor: '#E57373',
    padding: 20,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  editarButton: {
    backgroundColor: '#E57373',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  editarButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  finalizarButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  finalizarButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
