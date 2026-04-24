import { useScriptStore } from '../store/useScriptStore';
import { Alert } from 'react-native';

export const KCAL_TO_KW = 0.00116222222;
export const KCAL_TO_W = 1.16222222;

export type EnergyUnit = 'W' | 'kW' | 'kVA' | 'kcal/h' | 'BTU/h';
export type EnergyCategory = 'electrical' | 'biological' | 'chemical';

// --- Fallback Internal Functions ---
const fallbackConvertToKW = (value: number, unit: EnergyUnit): number => {
  switch (unit) {
    case 'W': return value / 1000;
    case 'kW':
    case 'kVA': return value;
    case 'kcal/h': return value * KCAL_TO_KW;
    case 'BTU/h': return value * 0.000293071;
    default: return value;
  }
};

const fallbackComputeDynamicPower = (baseValue: number, attributes?: Record<string, number>, formula?: string): number => {
  if (!formula || !attributes) return baseValue;
  try {
    const keys = Object.keys(attributes);
    const values = Object.values(attributes);
    const calcFunc = new Function(...keys, formula);
    const result = calcFunc(...values);
    return isNaN(result) ? baseValue : result;
  } catch (err) {
    console.error('Fallback evaluate error:', err);
    return baseValue;
  }
};

let fallbackNotified = false;

// --- Runtime Interceptors ---
const getRuntimeExports = () => {
  const { compiledJs } = useScriptStore.getState();
  if (!compiledJs) return null;

  try {
    const exports: any = {};
    const runner = new Function('exports', compiledJs);
    runner(exports);
    return exports;
  } catch (err) {
    if (!fallbackNotified) {
      console.error('Runtime Script Evaluation Error:', err);
      // We don't want to spam the alert if it's called 100 times in a loop
      Alert.alert('Erro de Script', 'O seu script falhou na execução. Usando a física padrão (Fallback).');
      fallbackNotified = true;
      setTimeout(() => { fallbackNotified = false; }, 10000); // Allow notifying again after 10s
    }
    return null;
  }
};

export const convertToKW = (value: number, unit: EnergyUnit): number => {
  const runtime = getRuntimeExports();
  if (runtime && typeof runtime.convertToKW === 'function') {
    try {
      return runtime.convertToKW(value, unit);
    } catch (e) {
      console.warn('Custom convertToKW failed, falling back.');
    }
  }
  return fallbackConvertToKW(value, unit);
};

export const computeDynamicPower = (baseValue: number, attributes?: Record<string, number>, formula?: string): number => {
  const runtime = getRuntimeExports();
  if (runtime && typeof runtime.computeDynamicPower === 'function') {
    try {
      return runtime.computeDynamicPower(baseValue, attributes, formula);
    } catch (e) {
      console.warn('Custom computeDynamicPower failed, falling back.');
    }
  }
  return fallbackComputeDynamicPower(baseValue, attributes, formula);
};

export const calculateKWh = (powerInKW: number, durationMs: number): number => {
  const durationHours = durationMs / (1000 * 60 * 60);
  return powerInKW * durationHours;
};

export const calculateTEP = (kwh: number): number => {
  return kwh * 0.00008598;
};
