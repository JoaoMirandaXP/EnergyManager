import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { transform } from 'sucrase';

const defaultTypeScriptCode = `// Defina suas funções de conversão e cálculo aqui
// Você pode usar TypeScript!

export const convertToKW = (value: number, unit: string): number => {
  switch (unit) {
    case 'W': return value / 1000;
    case 'kW': return value;
    case 'kVA': return value; // Aparente
    case 'kcal/h': return value * 0.00116222222;
    case 'BTU/h': return value * 0.000293071;
    default: return value;
  }
};

export const computeDynamicPower = (
  baseValue: number, 
  attributes?: Record<string, number>, 
  formula?: string
): number => {
  if (!formula || !attributes) return baseValue;
  try {
    const keys = Object.keys(attributes);
    const values = Object.values(attributes);
    const calcFunc = new Function(...keys, formula);
    const result = calcFunc(...values);
    return isNaN(result) ? baseValue : result;
  } catch (err) {
    return baseValue;
  }
};
`;

interface ScriptState {
  tsCode: string;
  compiledJs: string;
  lastCompileError: string | null;
  setTsCode: (code: string) => void;
  compileAndSave: () => boolean;
}

export const useScriptStore = create<ScriptState>()(
  persist(
    (set, get) => ({
      tsCode: defaultTypeScriptCode,
      compiledJs: '',
      lastCompileError: null,
      setTsCode: (code) => set({ tsCode: code }),
      compileAndSave: () => {
        try {
          const { tsCode } = get();
          
          // Transpile TypeScript to generic JS
          const compiled = transform(tsCode, { transforms: ['typescript', 'imports'] });
          
          // Basic validation to see if it parses as valid JS
          new Function('exports', compiled.code);
          
          set({ compiledJs: compiled.code, lastCompileError: null });
          return true;
        } catch (err: any) {
          set({ lastCompileError: err.message || 'Erro de Compilação' });
          return false;
        }
      }
    }),
    {
      name: 'energy-script-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
