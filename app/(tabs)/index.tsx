import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useEnergyStore } from '../../src/store/useEnergyStore';
import { Theme } from '../../src/utils/theme';
import { calculateTEP } from '../../src/utils/energy';
import { LineChart } from 'react-native-chart-kit';
import { startOfDay, endOfDay, format } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

export default function Dashboard() {
  const { logs } = useEnergyStore();

  const todayData = useMemo(() => {
    const todayStart = startOfDay(new Date()).getTime();
    const todayEnd = endOfDay(new Date()).getTime();

    const todayLogs = logs.filter(l => l.startTime >= todayStart && l.endTime <= todayEnd);

    let totalKWh = 0;
    
    // Create hourly buckets for the chart (0 to 23)
    const hourlyPower = new Array(24).fill(0);

    todayLogs.forEach(log => {
      totalKWh += log.consumedKWh;
      const startHour = new Date(log.startTime).getHours();
      // Rough approximation: assign total energy of log to the start hour
      // In a more complex version, we would distribute energy proportionally
      hourlyPower[startHour] += log.consumedKWh * 1000; // Wh for that hour (~Watts average)
    });

    const maxPower = Math.max(...hourlyPower, 1); // prevent division by zero
    const averagePower = hourlyPower.reduce((a, b) => a + b, 0) / 24;
    const loadFactor = averagePower / maxPower;

    return {
      totalKWh,
      tep: calculateTEP(totalKWh),
      loadFactor,
      hourlyPower,
    };
  }, [logs]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Dashboard</Text>

      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Consumo Total</Text>
          <Text style={styles.cardValue}>{todayData.totalKWh.toFixed(2)}</Text>
          <Text style={styles.cardUnit}>kWh</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>TEP</Text>
          <Text style={styles.cardValue}>{todayData.tep.toFixed(6)}</Text>
          <Text style={styles.cardUnit}>tep</Text>
        </View>
      </View>

      <View style={[styles.card, styles.fullWidthCard]}>
        <Text style={styles.cardLabel}>Fator de Carga Diário</Text>
        <Text style={[styles.cardValue, { color: Theme.colors.secondary }]}>
          {(todayData.loadFactor * 100).toFixed(1)}%
        </Text>
        <Text style={styles.cardUnit}>Otimize seus hábitos para nivelar o consumo</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Curva de Potência Diária (Wh/h)</Text>
        <LineChart
          key={logs.length}
          data={{
            labels: ['0h', '4h', '8h', '12h', '16h', '20h'],
            datasets: [
              {
                data: [
                  todayData.hourlyPower[0],
                  todayData.hourlyPower[4],
                  todayData.hourlyPower[8],
                  todayData.hourlyPower[12],
                  todayData.hourlyPower[16],
                  todayData.hourlyPower[20],
                ],
              },
            ],
          }}
          width={screenWidth - Theme.spacing.lg * 2}
          height={220}
          yAxisSuffix="W"
          chartConfig={{
            backgroundColor: Theme.colors.card,
            backgroundGradientFrom: Theme.colors.card,
            backgroundGradientTo: Theme.colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // primary color
            labelColor: (opacity = 1) => Theme.colors.textMuted,
            style: {
              borderRadius: Theme.borderRadius.md,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: Theme.colors.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: Theme.spacing.lg,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    flex: 1,
    marginHorizontal: Theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  fullWidthCard: {
    marginHorizontal: 0,
    marginBottom: Theme.spacing.md,
  },
  cardLabel: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Theme.spacing.xs,
  },
  cardValue: {
    color: Theme.colors.primary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  cardUnit: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    marginTop: Theme.spacing.xs,
  },
  chartContainer: {
    marginTop: Theme.spacing.md,
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  chartTitle: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Theme.spacing.md,
    alignSelf: 'flex-start',
  },
  chart: {
    borderRadius: Theme.borderRadius.md,
  },
});