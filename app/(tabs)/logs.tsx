import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useEnergyStore } from '../../src/store/useEnergyStore';
import { Theme } from '../../src/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

export default function LogsScreen() {
  const { logs, equipments, addLog, removeLog } = useEnergyStore();
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [selectedEqId, setSelectedEqId] = useState<string>('');
  const [durationMins, setDurationMins] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSave = () => {
    if (!selectedEqId || !durationMins) return;

    const mins = parseInt(durationMins, 10);
    const endTime = Date.now();
    const startTime = endTime - (mins * 60 * 1000);

    addLog({
      equipmentId: selectedEqId,
      startTime,
      endTime,
      notes,
    });

    setModalVisible(false);
    setSelectedEqId('');
    setDurationMins('');
    setNotes('');
  };

  const renderItem = ({ item }: { item: any }) => {
    const eq = equipments.find(e => e.id === item.equipmentId);
    if (!eq) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{eq.name}</Text>
          <Text style={styles.cardDetail}>
            {format(new Date(item.startTime), 'HH:mm')} - {format(new Date(item.endTime), 'HH:mm')} ({Math.round(item.durationMs / 60000)} min)
          </Text>
          {item.notes ? <Text style={styles.cardNotes}>"{item.notes}"</Text> : null}
        </View>
        <View style={styles.energyBlock}>
          <Text style={styles.energyValue}>{item.consumedKWh.toFixed(3)}</Text>
          <Text style={styles.energyUnit}>kWh</Text>
          <TouchableOpacity onPress={() => removeLog(item.id)} style={styles.deleteBtn}>
            <Ionicons name="close-circle" size={24} color={Theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Diário de Eventos</Text>
      
      <FlatList
        data={[...logs].reverse()} // Show newest first
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum evento registrado ainda.</Text>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Registrar Atividade</Text>
            
            <Text style={styles.label}>Selecione o Objeto/Hábito:</Text>
            <View style={styles.eqList}>
              {equipments.map(eq => (
                <TouchableOpacity 
                  key={eq.id}
                  style={[styles.eqPill, selectedEqId === eq.id && styles.eqPillActive]}
                  onPress={() => setSelectedEqId(eq.id)}
                >
                  <Text style={[styles.eqPillText, selectedEqId === eq.id && styles.eqPillTextActive]}>
                    {eq.name}
                  </Text>
                </TouchableOpacity>
              ))}
              {equipments.length === 0 && (
                <Text style={styles.emptyText}>Cadastre um equipamento primeiro!</Text>
              )}
            </View>

            <TextInput 
              style={styles.input} 
              placeholder="Duração (minutos)" 
              placeholderTextColor={Theme.colors.textMuted}
              keyboardType="numeric"
              value={durationMins}
              onChangeText={setDurationMins}
            />

            <TextInput 
              style={styles.input} 
              placeholder="Notas (opcional)" 
              placeholderTextColor={Theme.colors.textMuted}
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, (!selectedEqId || !durationMins) && { opacity: 0.5 }]} 
                onPress={handleSave}
                disabled={!selectedEqId || !durationMins}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.text,
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  listContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: 100,
  },
  emptyText: {
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDetail: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  cardNotes: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  energyBlock: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  energyValue: {
    color: Theme.colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  energyUnit: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
  deleteBtn: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: Theme.spacing.lg,
    bottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
  },
  label: {
    color: Theme.colors.textMuted,
    marginBottom: Theme.spacing.sm,
  },
  eqList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Theme.spacing.lg,
  },
  eqPill: {
    backgroundColor: Theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.full,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  eqPillActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  eqPillText: {
    color: Theme.colors.textMuted,
  },
  eqPillTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: Theme.colors.background,
    color: Theme.colors.text,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Theme.spacing.sm,
  },
  cancelButton: {
    padding: Theme.spacing.md,
    marginRight: Theme.spacing.sm,
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.xl,
  },
  buttonText: {
    color: Theme.colors.text,
    fontWeight: 'bold',
  }
});
