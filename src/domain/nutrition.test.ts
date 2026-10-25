import { describe, expect, it } from 'vitest'
import { findFoodReference, scaleNutrients, totalNutrients } from './nutrition'

describe('editable nutrition estimates', () => {
  it('finds a local starter reference without pretending unknown meals are known', () => {
    expect(findFoodReference('one bowl of dal')).toMatchObject({ id: 'cooked_lentils' })
    expect(findFoodReference('mystery restaurant dish')).toBeUndefined()
  })

  it('scales a portion estimate consistently', () => {
    const dal = findFoodReference('dal')!
    const halfPortion = scaleNutrients(dal.nutrients, 0.5)
    expect(halfPortion.calories).toBe(115)
    expect(halfPortion.proteinG).toBe(9)
  })

  it('sums nutrient logs while retaining micronutrients', () => {
    const dal = findFoodReference('dal')!
    const rice = findFoodReference('rice')!
    const total = totalNutrients([{ nutrients: dal.nutrients }, { nutrients: rice.nutrients }])
    expect(total.calories).toBe(435)
    expect(total.proteinG).toBe(22.2)
    expect(total.ironMg).toBe(8.5)
  })
})
