import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useScriptStore } from '../../src/store/useScriptStore';
import { Theme } from '../../src/utils/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ScriptScreen() {
  const { tsCode, setTsCode, compileAndSave, lastCompileError } = useScriptStore();
  const [localCode, setLocalCode] = useState(tsCode);

  const handleCompile = () => {
    setTsCode(localCode);
    
    // We need to wait for Zustand to update or just run compile directly
    // compileAndSave accesses get(), so state needs to be flushed.
    // Zustand set() is synchronous, so it should be fine.
    setTimeout(() => {
      const success = useScriptStore.getState().compileAndSave();
      if (success) {
        Alert.alert('Sucesso', 'Seu código foi compilado e salvo! O app agora usa suas regras.', [{ text: 'OK' }]);
      } else {
        const err = useScriptStore.getState().lastCompileError;
        Alert.alert('Erro de Compilação', err || 'Verifique a sintaxe TypeScript.', [{ text: 'Entendido' }]);
      }
    }, 50);
  };

  const handleReset = () => {
    Alert.alert(
      'Restaurar Padrão', 
      'Tem certeza que deseja apagar o seu código atual e restaurar o template base?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Restaurar', onPress: () => {
            const defaultCode = `// Defina suas funções de conversão e cálculo aqui\n// Você pode usar TypeScript!\n\nexport const convertToKW = (value: number, unit: string): number => {\n  switch (unit) {\n    case 'W': return value / 1000;\n    case 'kW': return value;\n    case 'kVA': return value;\n    case 'kcal/h': return value * 0.00116222222;\n    case 'BTU/h': return value * 0.000293071;\n    default: return value;\n  }\n};\n\nexport const computeDynamicPower = (\n  baseValue: number, \n  attributes?: Record<string, number>, \n  formula?: string\n): number => {\n  if (!formula || !attributes) return baseValue;\n  try {\n    const keys = Object.keys(attributes);\n    const values = Object.values(attributes);\n    const calcFunc = new Function(...keys, formula);\n    const result = calcFunc(...values);\n    return isNaN(result) ? baseValue : result;\n  } catch (err) {\n    return baseValue;\n  }\n};\n`;
            setLocalCode(defaultCode);
        }}
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Engine Script</Text>
      
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={24} color={Theme.colors.primary} />
        <Text style={styles.infoText}>
          Aqui você pode sobrepor as leis do sistema. Escreva código TypeScript puro. 
          As funções `convertToKW` e `computeDynamicPower` interceptarão os cálculos padrão.
        </Text>
      </View>

      <View style={styles.editorContainer}>
        <ScrollView style={styles.editorScroll} contentContainerStyle={styles.editorScrollContent}>
          <TextInput
            style={styles.editorInput}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            value={localCode}
            onChangeText={setLocalCode}
            placeholder="// Digite seu código TypeScript aqui..."
            placeholderTextColor={Theme.colors.textMuted}
          />
        </ScrollView>
      </View>

      {lastCompileError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Erro Atual: {lastCompileError}</Text>
        </View>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Ionicons name="refresh" size={20} color={Theme.colors.textMuted} />
          <Text style={styles.resetText}>Restaurar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.compileBtn} onPress={handleCompile}>
          <Ionicons name="build" size={20} color="#fff" />
          <Text style={styles.compileText}>Compilar & Salvar</Text>
        </TouchableOpacity>
      </View>
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.card,
    marginHorizontal: Theme.spacing.lg,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  infoText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    marginLeft: Theme.spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  editorContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E', // VSCode like dark theme
    marginHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.md,
  },
  editorScroll: {
    flex: 1,
  },
  editorScrollContent: {
    padding: Theme.spacing.md,
  },
  editorInput: {
    color: '#D4D4D4',
    fontFamily: 'monospace',
    fontSize: 14,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginHorizontal: Theme.spacing.lg,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.danger,
  },
  errorText: {
    color: Theme.colors.danger,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    flex: 0.4,
    justifyContent: 'center',
  },
  resetText: {
    color: Theme.colors.textMuted,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  compileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    flex: 0.55,
    justifyContent: 'center',
  },
  compileText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  }
});
