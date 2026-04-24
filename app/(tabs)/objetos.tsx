import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useEnergyStore } from '../../src/store/useEnergyStore';
import { Theme } from '../../src/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { EnergyCategory, EnergyUnit, computeDynamicPower } from '../../src/utils/energy';

export default function EquipmentsScreen() {
  const { equipments, addEquipment, removeEquipment } = useEnergyStore();
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EnergyCategory>('electrical');
  const [powerValue, setPowerValue] = useState('');
  const [powerUnit, setPowerUnit] = useState<EnergyUnit>('W');
  const [powerFormula, setPowerFormula] = useState('');
  
  // Dynamic Attributes Form State
  const [attributes, setAttributes] = useState<Record<string, number>>({});
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');

  const handleAddAttribute = () => {
    if (newAttrName && newAttrValue) {
      setAttributes({ ...attributes, [newAttrName]: parseFloat(newAttrValue) });
      setNewAttrName('');
      setNewAttrValue('');
    }
  };

  const handleRemoveAttribute = (key: string) => {
    const newAttrs = { ...attributes };
    delete newAttrs[key];
    setAttributes(newAttrs);
  };

  const handleSave = () => {
    if (!name) return;
    
    addEquipment({
      name,
      category,
      powerValue: parseFloat(powerValue) || 0,
      powerUnit,
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
      powerFormula: powerFormula.trim() || undefined,
    });
    
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setPowerValue('');
    setPowerFormula('');
    setAttributes({});
    setCategory('electrical');
    setPowerUnit('W');
    setNewAttrName('');
    setNewAttrValue('');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'electrical': return 'flash';
      case 'chemical': return 'flame';
      default: return 'body';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'electrical': return Theme.colors.secondary;
      case 'chemical': return '#F59E0B'; // Amber/Orange
      default: return Theme.colors.primary;
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const computedPower = computeDynamicPower(item.powerValue, item.attributes, item.powerFormula);
    
    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Ionicons 
              name={getCategoryIcon(item.category)} 
              size={20} 
              color={getCategoryColor(item.category)} 
            />
            <Text style={styles.cardTitle}>{item.name}</Text>
          </View>
          <Text style={styles.cardDetail}>
            {item.powerFormula ? `(Dinâmico) ~` : ''}
            {computedPower.toFixed(2)} {item.powerUnit}
          </Text>
          {item.powerFormula && (
            <Text style={styles.cardFormulaText}>Fórmula: {item.powerFormula}</Text>
          )}
        </View>
        <TouchableOpacity onPress={() => removeEquipment(item.id)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color={Theme.colors.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Equipamentos & Hábitos</Text>
      
      <FlatList
        data={equipments}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum objeto instanciado. Adicione o seu primeiro!</Text>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setModalVisible(true); }}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Novo Objeto</Text>
              
              <TextInput 
                style={styles.input} 
                placeholder="Nome (ex: Fogão, Metrô, Bicicleta)" 
                placeholderTextColor={Theme.colors.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.sectionLabel}>Categoria:</Text>
              <View style={styles.row}>
                {(['electrical', 'biological', 'chemical'] as EnergyCategory[]).map(cat => (
                  <TouchableOpacity 
                    key={cat}
                    style={[styles.toggleBtn, category === cat && styles.toggleActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={styles.toggleText}>
                      {cat === 'electrical' ? 'Elétrico' : cat === 'chemical' ? 'Químico' : 'Biológico'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Unidade de Potência Independente:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
                {(['W', 'kW', 'kVA', 'kcal/h', 'BTU/h'] as EnergyUnit[]).map(unit => (
                  <TouchableOpacity 
                    key={unit}
                    style={[styles.unitBtn, powerUnit === unit && styles.unitBtnActive]}
                    onPress={() => setPowerUnit(unit)}
                  >
                    <Text style={styles.unitBtnText}>{unit}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.sectionLabel}>Potência Base / Estática:</Text>
              <TextInput 
                style={styles.input} 
                placeholder={`Valor (${powerUnit})`}
                placeholderTextColor={Theme.colors.textMuted}
                keyboardType="numeric"
                value={powerValue}
                onChangeText={setPowerValue}
              />

              <Text style={styles.sectionLabel}>Atributos Dinâmicos (Opcional):</Text>
              {Object.keys(attributes).map(key => (
                <View key={key} style={styles.attrRow}>
                  <Text style={styles.attrText}>{key}: {attributes[key]}</Text>
                  <TouchableOpacity onPress={() => handleRemoveAttribute(key)}>
                    <Ionicons name="close-circle" size={20} color={Theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.attrInputRow}>
                <TextInput 
                  style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]} 
                  placeholder="Nome Var" 
                  placeholderTextColor={Theme.colors.textMuted}
                  value={newAttrName}
                  onChangeText={setNewAttrName}
                />
                <TextInput 
                  style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]} 
                  placeholder="Valor" 
                  placeholderTextColor={Theme.colors.textMuted}
                  keyboardType="numeric"
                  value={newAttrValue}
                  onChangeText={setNewAttrValue}
                />
                <TouchableOpacity style={styles.addAttrBtn} onPress={handleAddAttribute}>
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionLabel}>Fórmula JS (Opcional):</Text>
              <Text style={styles.hintText}>Ex: return potencia_carro * n_carros / estimativa_pessoas</Text>
              <TextInput 
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                placeholder="Ex: return var1 * var2;" 
                placeholderTextColor={Theme.colors.textMuted}
                multiline
                value={powerFormula}
                onChangeText={setPowerFormula}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.buttonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
    marginTop: 40,
  },
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  cardTitle: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: Theme.spacing.sm,
  },
  cardDetail: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    marginLeft: 28,
  },
  cardFormulaText: {
    color: Theme.colors.primary,
    fontSize: 12,
    marginLeft: 28,
    marginTop: 4,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: Theme.spacing.sm,
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
  },
  modalScrollContent: {
    padding: Theme.spacing.lg,
    paddingVertical: 60,
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
  sectionLabel: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    marginBottom: Theme.spacing.xs,
    marginTop: Theme.spacing.sm,
  },
  hintText: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    marginBottom: Theme.spacing.xs,
    fontStyle: 'italic',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  toggleBtn: {
    flex: 1,
    padding: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    marginHorizontal: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  toggleActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  toggleText: {
    color: Theme.colors.text,
    fontWeight: 'bold',
    fontSize: 12,
  },
  unitScroll: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
  },
  unitBtn: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.full,
    marginRight: Theme.spacing.sm,
  },
  unitBtnActive: {
    backgroundColor: Theme.colors.secondary,
    borderColor: Theme.colors.secondary,
  },
  unitBtnText: {
    color: Theme.colors.text,
    fontWeight: 'bold',
  },
  attrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.sm,
  },
  attrText: {
    color: Theme.colors.text,
  },
  attrInputRow: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.lg,
  },
  addAttrBtn: {
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Theme.spacing.md,
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