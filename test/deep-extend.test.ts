import { expect } from 'chai'

import { deepExtend } from '../src'

describe('deepExtend', function(): void {
  describe('copy 1, overwrite 1, ignore 1', function(): void {
    it('shallow → shallow', function(): void {
      const target = { a: 'a_org', b: 'b_org' }
      const source = Object.freeze({ a: 'a_new', c: 'c_new' })
      const copied = deepExtend(target, source)

      expect(copied, 'They should be the same instance.').to.equal(target)
      expect(copied, 'The selected properties of the objects should be deeply merged').to.deep.equal({
        a: 'a_new',
        b: 'b_org',
        c: 'c_new',
      })
    })

    it('deep → deep', function(): void {
      const target = {
        a: {
          a0: 'a0_org',
          a1: 'a1_org'
        },
        b: {
          b0: 'b0_org',
          b1: 'b1_org'
        }
      }
      const source = Object.freeze({
        b: {
          b2: {
            b20: 'b20_new'
          }
        }
      })
      const copied = deepExtend(target, source)

      expect(copied, 'They should be the same instance.').to.equal(target)
      expect(copied, 'The selected properties of the objects should be deeply merged').to.deep.equal({
        a: {
          a0: 'a0_org',
          a1: 'a1_org'
        },
        b: {
          b0: 'b0_org',
          b1: 'b1_org',
          b2: {
            b20: 'b20_new'
          }
        }
      })
    })

    it('array member → array member', function(): void {
      const target = { a: ['arr0', 'arr1' , 'arr2'] }
      const source = Object.freeze({ a: ['arr0_new', 'arr1_new' , 'arr2_new'] })
      const copied = deepExtend(target, source)

      expect(copied, 'They should be the same instance.').to.equal(target)
      expect(copied, 'The selected properties of the objects should be deeply merged').to.deep.equal({
        a: ['arr0_new', 'arr1_new' , 'arr2_new']
      })
    })
  })

  describe('deepExtend with parameter allowDeletion', function(): void {
    it('allowDeletion: default=false', function(): void {
      const target = { a: 'a_org', b: 'b_org', c: null }
      const source = Object.freeze({ a: 'a_new', b: null })
      const copied = deepExtend(target, source, false, false)

      expect(copied, 'They should be the same instance.').to.equal(target)
      expect(copied, 'The selected properties of the objects should be deeply merged').to.deep.equal({
        a: 'a_new',
        b: null,
        c: null
      })
    })

    it('allowDeletion: true', function(): void {
      const target = { a: 'a_org', b: 'b_org', c: null }
      const source = Object.freeze({ a: 'a_new', b: null })
      const copied = deepExtend(target, source, false, true)

      expect(copied, 'They should be the same instance.').to.equal(target)
      expect(copied, 'The selected properties of the objects should be deeply merged').to.deep.equal({
        a: 'a_new',
        c: null
      })
    })
  })
})
