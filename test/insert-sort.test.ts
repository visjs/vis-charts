import { expect } from 'chai'

import { insertSort } from '../src'

describe('insertSort', function(): void {
  it('Sorted data should stay in the same order', function(): void {
    const getData = (): number[] => [
      Number.NEGATIVE_INFINITY,
      Number.MIN_SAFE_INTEGER,
      -7,
      -1,
      0,
      Number.MIN_VALUE,
      0.001,
      1,
      Math.PI,
      10,
      20,
      23.4,
      156,
      1000,
      2000,
      Number.MAX_SAFE_INTEGER,
      Number.MAX_VALUE,
      Number.POSITIVE_INFINITY,
    ]

    expect(insertSort(getData(), (a, b): number => a - b)).to.deep.equal(getData())
  })

  it('Same values should never swap places', function(): void {
    const getData = (): { index?: number; value: number }[] => [
      { value: 11 },
      { index: 6, value: 7 },
      { index: 7, value: 7 },
      { value: -23 },
      { value: -28 },
      { value: 21 },
      { value: -16 },
      { value: 27 },
      { index: 8, value: 7 },
      { value: -27 },
      { index: 9, value: 7 },
      { value: -7 },
      { value: 48 },
      { index: 10, value: 7 },
      { value: -77 },
      { value: 22 },
    ]

    const sorted = insertSort(getData(), (a, b): number => a.value - b.value)
    sorted.forEach(({ index }, arrayIndex): void => {
      if (index != null) {
        expect(index).to.equal(arrayIndex)
      }
    })
  })
})
