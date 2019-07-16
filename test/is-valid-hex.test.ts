import { expect } from 'chai'

import { isValidHex } from '../src'

describe('isValidHex', function(): void {
  const valid = ['#000000', '#0acdc0', '#AC00DC', '#09afAF', '#000', '#0ac', '#0DC', '#09a', '#fAF']
  const invalid = [
    // without #
    ...valid.map((color): string => color.slice(1)),
    // 5 or 2 digits
    ...valid.map((color): string => color.slice(0, -1)),
    // 4 or 1 digit
    ...valid.map((color): string => color.slice(0, -2)),
    // 7 or 4 digits
    ...valid.map((color): string => color + '0'),
    // 8 or 5 digits
    ...valid.map((color): string => color + 'Fa'),
    ' #000000',
    ' ',
    '##abc',
    '#000 ',
    '#ABC is a color',
    '#abc-ef',
    '#Ř0AABB',
    '',
    '0',
    'false',
    'garbage',
    'orange',
    'the color is #00AAAA',
    'true',
  ]

  describe('Valid', function(): void {
    valid.forEach((color): void => {
      it(color, function(): void {
        expect(isValidHex(color)).to.be.true
      })
    })
  })

  describe('Invalid', function(): void {
    invalid.forEach((color): void => {
      it(color, function(): void {
        expect(isValidHex(color)).to.be.false
      })
    })
  })
})
