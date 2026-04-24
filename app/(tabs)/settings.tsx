import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useEnergyStore } from '../../src/store/useEnergyStore';
import { Theme } from '../../src/utils/theme';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { logs, equipments } = useEnergyStore();

  const exportData = async (format: 'json' | 'csv') => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      let fileUri = '';
      let fileContent = '';

      if (format === 'json') {
        const data = { equipments, logs };
        fileContent = JSON.stringify(data, null, 2);
        fileUri = `${FileSystem.documentDirectory}energy_data_${timestamp}.json`;
      } else {
        // Simple CSV Export for Matlab/Python
        const headers = 'LogId,EquipmentName,EquipmentCategory,PowerKW,StartTime,EndTime,DurationMs,ConsumedKWh,Notes\n';
        const rows = logs.map(log => {
          const eq = equipments.find(e => e.id === log.equipmentId);
          return `${log.id},"${eq?.name || 'Unknown'}","${eq?.category || ''}",${eq ? eq.powerValue : 0},${log.startTime},${log.endTime},${log.durationMs},${log.consumedKWh},"${log.notes || ''}"`;
        }).join('\n');
        
        fileContent = headers + rows;
        fileUri = `${FileSystem.documentDirectory}energy_data_${timestamp}.csv`;
      }

      await FileSystem.writeAsStringAsync(fileUri, fileContent, { encoding: FileSystem.EncodingType.UTF8 });
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo.');
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao exportar os dados.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Ajustes e Exportação</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exportar Dados</Text>
        <Text style={styles.sectionDesc}>
          Exporte seus dados para análise avançada no Matlab, Python ou Excel.
        </Text>

        <TouchableOpacity style={styles.exportBtn} onPress={() => exportData('csv')}>
          <Ionicons name="document-text" size={24} color="#fff" />
          <Text style={styles.exportBtnText}>Exportar como CSV</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.exportBtn, { backgroundColor: Theme.colors.secondary }]} onPress={() => exportData('json')}>
          <Ionicons name="code-slash" size={24} color="#fff" />
          <Text style={styles.exportBtnText}>Exportar como JSON</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre o CalDAV</Text>
        <Text style={styles.sectionDesc}>
          A integração nativa com o Radicale será implementada no futuro através de uma API intermediária para melhorar a performance do app.
        </Text>
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
    marginBottom: Theme.spacing.lg,
  },
  section: {
    backgroundColor: Theme.colors.card,
    marginHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  sectionDesc: {
    color: Theme.colors.textMuted,
    marginBottom: Theme.spacing.lg,
    lineHeight: 20,
  },
  exportBtn: {
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.md,
  },
  exportBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: Theme.spacing.sm,
  }
});
