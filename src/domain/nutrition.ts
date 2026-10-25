import type { MealNutrients } from './types'

export interface FoodReference {
  id: string
  name: string
  aliases: string[]
  serving: string
  sourceLabel: string
  nutrients: MealNutrients
}

/**
 * Small offline reference used only as an editable starting estimate. Production
 * deployments should configure a licensed / validated server-side food database
 * adapter before presenting nutrient figures as database-backed.
 */
export const FOOD_REFERENCE: FoodReference[] = [
  {
    id: 'cooked_lentils',
    name: 'Cooked lentils (dal)',
    aliases: ['dal', 'lentil', 'lentils'],
    serving: '1 cup cooked',
    sourceLabel: 'editable starter reference',
    nutrients: { calories: 230, proteinG: 17.9, carbsG: 39.9, fatG: 0.8, fiberG: 15.6, ironMg: 6.6, zincMg: 2.5, calciumMg: 37, folateMcG: 358 },
  },
  {
    id: 'cooked_rice',
    name: 'Cooked white rice',
    aliases: ['rice', 'chawal'],
    serving: '1 cup cooked',
    sourceLabel: 'editable starter reference',
    nutrients: { calories: 205, proteinG: 4.3, carbsG: 44.5, fatG: 0.4, fiberG: 0.6, ironMg: 1.9, zincMg: 0.8, calciumMg: 19, folateMcG: 4 },
  },
  {
    id: 'chapati',
    name: 'Whole-wheat chapati',
    aliases: ['roti', 'chapati', 'phulka'],
    serving: '1 medium',
    sourceLabel: 'editable starter reference',
    nutrients: { calories: 104, proteinG: 3.6, carbsG: 21.8, fatG: 0.7, fiberG: 3.1, ironMg: 1.2, zincMg: 0.8, calciumMg: 11, folateMcG: 10 },
  },
  {
    id: 'plain_yogurt',
    name: 'Plain yogurt',
    aliases: ['curd', 'dahi', 'yogurt'],
    serving: '1 cup',
    sourceLabel: 'editable starter reference',
    nutrients: { calories: 149, proteinG: 8.5, carbsG: 11.4, fatG: 8, fiberG: 0, ironMg: 0.1, zincMg: 1.4, calciumMg: 296, vitaminB12McG: 1.4, folateMcG: 29 },
  },
  {
    id: 'paneer',
    name: 'Paneer',
    aliases: ['paneer', 'cottage cheese'],
    serving: '100 g',
    sourceLabel: 'editable starter reference',
    nutrients: { calories: 265, proteinG: 18.3, carbsG: 1.2, fatG: 20.8, fiberG: 0, ironMg: 0.2, zincMg: 2.7, calciumMg: 714, vitaminB12McG: 1.1, folateMcG: 18 },
  },
  {
    id: 'banana',
    name: 'Banana',
    aliases: ['banana', 'kela'],
    serving: '1 medium',
    sourceLabel: 'editable starter reference',
    nutrients: { calories: 105, proteinG: 1.3, carbsG: 27, fatG: 0.4, fiberG: 3.1, ironMg: 0.3, zincMg: 0.2, calciumMg: 6, folateMcG: 24 },
  },
  {
    id: 'egg',
    name: 'Egg',
    aliases: ['egg', 'anda'],
    serving: '1 large',
    sourceLabel: 'editable starter reference',
    nutrients: { calories: 72, proteinG: 6.3, carbsG: 0.4, fatG: 4.8, fiberG: 0, ironMg: 0.9, zincMg: 0.6, calciumMg: 28, vitaminB12McG: 0.6, folateMcG: 22 },
  },
]

export const emptyNutrients = (): MealNutrients => ({
  calories: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
  fiberG: 0,
  ironMg: 0,
  zincMg: 0,
  calciumMg: 0,
  vitaminB12McG: 0,
  folateMcG: 0,
})

export function findFoodReference(query: string): FoodReference | undefined {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return undefined
  return FOOD_REFERENCE.find((food) =>
    [food.name.toLowerCase(), ...food.aliases].some((term) => normalized.includes(term) || term.includes(normalized)),
  )
}

export function scaleNutrients(nutrients: MealNutrients, multiplier: number): MealNutrients {
  const scale = (value: number | undefined) => value === undefined ? undefined : Math.round(value * multiplier * 10) / 10
  return {
    calories: Math.round(nutrients.calories * multiplier),
    proteinG: scale(nutrients.proteinG) ?? 0,
    carbsG: scale(nutrients.carbsG) ?? 0,
    fatG: scale(nutrients.fatG) ?? 0,
    fiberG: scale(nutrients.fiberG) ?? 0,
    ironMg: scale(nutrients.ironMg),
    zincMg: scale(nutrients.zincMg),
    calciumMg: scale(nutrients.calciumMg),
    vitaminB12McG: scale(nutrients.vitaminB12McG),
    folateMcG: scale(nutrients.folateMcG),
  }
}

export function totalNutrients(entries: { nutrients: MealNutrients }[]): MealNutrients {
  return entries.reduce<MealNutrients>((total, entry) => ({
    calories: total.calories + entry.nutrients.calories,
    proteinG: Math.round((total.proteinG + entry.nutrients.proteinG) * 10) / 10,
    carbsG: Math.round((total.carbsG + entry.nutrients.carbsG) * 10) / 10,
    fatG: Math.round((total.fatG + entry.nutrients.fatG) * 10) / 10,
    fiberG: Math.round((total.fiberG + entry.nutrients.fiberG) * 10) / 10,
    ironMg: Math.round(((total.ironMg ?? 0) + (entry.nutrients.ironMg ?? 0)) * 10) / 10,
    zincMg: Math.round(((total.zincMg ?? 0) + (entry.nutrients.zincMg ?? 0)) * 10) / 10,
    calciumMg: Math.round(((total.calciumMg ?? 0) + (entry.nutrients.calciumMg ?? 0)) * 10) / 10,
    vitaminB12McG: Math.round(((total.vitaminB12McG ?? 0) + (entry.nutrients.vitaminB12McG ?? 0)) * 10) / 10,
    folateMcG: Math.round(((total.folateMcG ?? 0) + (entry.nutrients.folateMcG ?? 0)) * 10) / 10,
  }), emptyNutrients())
}

export function formatNutrient(value: number | undefined, unit: string, digits = 0): string {
  if (value === undefined || Number.isNaN(value)) return '—'
  return `${value.toFixed(digits)} ${unit}`
}
