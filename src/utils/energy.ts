export const KCAL_TO_KW = 0.00116222222;
export const KCAL_TO_W = 1.16222222;

export type EnergyUnit = 'W' | 'kW' | 'kVA' | 'kcal/h' | 'BTU/h';
export type EnergyCategory = 'electrical' | 'biological' | 'chemical';

/**
 * Converts any supported power unit to kW for standard internal calculations.
 */
export const convertToKW = (value: number, unit: EnergyUnit): number => {
  switch (unit) {
    case 'W':
      return value / 1000;
    case 'kW':
    case 'kVA': // Approximate apparent power to real power for simple tracking
      return value;
    case 'kcal/h':
      return value * KCAL_TO_KW;
    case 'BTU/h':
      return value * 0.000293071;
    default:
      return value;
  }
};

/**
 * Computes the dynamic power of an equipment if a formula is provided.
 */
export const computeDynamicPower = (baseValue: number, attributes?: Record<string, number>, formula?: string): number => {
  if (!formula || !attributes) return baseValue;
  try {
    const keys = Object.keys(attributes);
    const values = Object.values(attributes);
    // Create a function with attribute keys as parameters
    const calcFunc = new Function(...keys, formula);
    const result = calcFunc(...values);
    return isNaN(result) ? baseValue : result;
  } catch (err) {
    console.error('Error evaluating formula:', err);
    return baseValue;
  }
};

/**
 * Calculates energy consumed in kWh given power and duration.
 * @param powerInKW The power of the equipment in kW
 * @param durationMs The duration of usage in milliseconds
 * @returns The total energy consumed in kWh
 */
export const calculateKWh = (powerInKW: number, durationMs: number): number => {
  const durationHours = durationMs / (1000 * 60 * 60);
  return powerInKW * durationHours;
};

/**
 * Calculates TEP (Tonelada Equivalente de Petróleo) from kWh
 * 1 kWh = 0.00008598 TEP (approx)
 */
export const calculateTEP = (kwh: number): number => {
  return kwh * 0.00008598;
};
