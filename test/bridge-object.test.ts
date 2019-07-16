import { expect } from 'chai'

import { bridgeObject } from '../src'

describe('bridgeObject', function(): void {
  describe('Invalid input', function(): void {
    ;[
      null,
      0,
      7,
      true,
      false,
      Symbol('This just shouldn‘t work.'),
      Number.POSITIVE_INFINITY,
      Number.NaN,
      '',
      'Have a nice day!',
    ].forEach((input): void => {
      it(typeof input === 'symbol' ? 'Symbol' : JSON.stringify(input), function(): void {
        expect(bridgeObject(input), 'Null should be returned for invalid input.').to.be.null
      })
    })
  })

  describe('Valid input', function(): void {
    // @TODO: Set up DOM objects for testing.

    describe('Empty object', function(): void {
      const object = {}
      let bridgedObject: {}

      it('Bridge the object', function(): void {
        bridgedObject = bridgeObject(object)
      })

      it('Bridged object shouldn‘t equal the original', function(): void {
        expect(bridgedObject).to.not.equal(object)
      })

      it('Bridged object should have the original as it‘s prototype', function(): void {
        expect(Object.getPrototypeOf(bridgedObject)).to.equal(object)
      })

      it('Bridged object should have no additional properies', function(): void {
        expect(Object.keys(bridgedObject)).to.be.empty
      })
    })

    describe('Nested objects', function(): void {
      const o1 = {}
      const o2 = {}
      const o3 = {}
      const o4 = {}

      const object = {
        1: o1,
        2: { 2: o2 },
        3: { 3: { 3: o3 } },
        4: { 4: { 4: { 4: o4 } } },
      }
      let bridgedObject: typeof object

      it('Bridge the object', function(): void {
        bridgedObject = bridgeObject(object)
      })

      it('Bridged object shouldn‘t equal the original', function(): void {
        expect(bridgedObject).to.not.equal(object)
      })

      it('Bridged object should have the original as it‘s prototype', function(): void {
        expect(Object.getPrototypeOf(bridgedObject)).to.equal(object)
      })

      it('Bridged object should have all original properties but no additional', function(): void {
        expect(Object.keys(bridgedObject).sort()).to.deep.equal(['1', '2', '3', '4'])
      })

      describe('Objects should be deeply bridged', function(): void {
        it('#1', function(): void {
          expect(bridgedObject[1]).to.not.equal(o1)
          expect(Object.getPrototypeOf(bridgedObject[1])).to.equal(o1)
        })

        it('#2', function(): void {
          expect(bridgedObject[2][2]).to.not.equal(o2)
          expect(Object.getPrototypeOf(bridgedObject[2][2])).to.equal(o2)
        })

        it('#3', function(): void {
          expect(bridgedObject[3][3][3]).to.not.equal(o3)
          expect(Object.getPrototypeOf(bridgedObject[3][3][3])).to.equal(o3)
        })

        it('#4', function(): void {
          expect(bridgedObject[4][4][4][4]).to.not.equal(o4)
          expect(Object.getPrototypeOf(bridgedObject[4][4][4][4])).to.equal(o4)
        })
      })
    })
  })
})
