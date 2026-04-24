import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EnergyUnit, EnergyCategory, convertToKW, calculateKWh, computeDynamicPower } from '../utils/energy';

export interface Equipment {
  id: string;
  name: string;
  category: EnergyCategory;
  powerValue: number;
  powerUnit: EnergyUnit;
  attributes?: Record<string, number>;
  powerFormula?: string;
  createdAt: number;
}

export interface EnergyLog {
  id: string;
  equipmentId: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  consumedKWh: number;
  notes?: string;
}

interface EnergyState {
  equipments: Equipment[];
  logs: EnergyLog[];
  addEquipment: (equipment: Omit<Equipment, 'id' | 'createdAt'>) => void;
  removeEquipment: (id: string) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  addLog: (log: Omit<EnergyLog, 'id' | 'durationMs' | 'consumedKWh'>) => void;
  removeLog: (id: string) => void;
}

export const useEnergyStore = create<EnergyState>()(
  persist(
    (set, get) => ({
      equipments: [],
      logs: [],
      addEquipment: (eq) => set((state) => ({
        equipments: [...state.equipments, { ...eq, id: Date.now().toString(), createdAt: Date.now() }]
      })),
      removeEquipment: (id) => set((state) => ({
        equipments: state.equipments.filter(e => e.id !== id)
      })),
      updateEquipment: (id, updates) => set((state) => ({
        equipments: state.equipments.map(e => e.id === id ? { ...e, ...updates } : e)
      })),
      addLog: (logData) => {
        const { equipments } = get();
        const equipment = equipments.find(e => e.id === logData.equipmentId);
        if (!equipment) return;

        const durationMs = logData.endTime - logData.startTime;
        
        // Calculate dynamic power if attributes and formula are present
        const effectivePower = computeDynamicPower(equipment.powerValue, equipment.attributes, equipment.powerFormula);
        const powerInKW = convertToKW(effectivePower, equipment.powerUnit);
        const consumedKWh = calculateKWh(powerInKW, durationMs);

        set((state) => ({
          logs: [...state.logs, {
            ...logData,
            id: Date.now().toString(),
            durationMs,
            consumedKWh
          }]
        }));
      },
      removeLog: (id) => set((state) => ({
        logs: state.logs.filter(l => l.id !== id)
      }))
    }),
    {
      name: 'energy-manager-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
