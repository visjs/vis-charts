import { expect } from 'chai'

import { selectiveDeepExtend } from '../src'

describe('selectiveDeepExtend', function(): void {
  describe('copy 1, overwrite 1, ignore 1', function(): void {
    it('shallow → shallow', function(): void {
      const target = { ignored: 'target', merged: 'target' }
      const source = Object.freeze({ ignored: 'source', merged: 'source', copied: 'source' })
      const copied = selectiveDeepExtend(['merged', 'copied'], target, source)

      expect(copied, 'They should be the same instance.').to.equal(target)
      expect(copied, 'The selected properties of the objects should be deeply merged').to.deep.equal({
        ignored: 'target',
        merged: 'source',
        copied: 'source',
      })
    })

    it('deep → deep', function(): void {
      const target = {
        ignored: { nested: { prop: 'target' }, additional: 'target' },
        merged: { nested: { prop: 'target', additional: 'target' } },
      }
      const source = Object.freeze({
        ignored: { nested: { prop: 'source', another: 'source' } },
        merged: { nested: { prop: 'source' }, another: 'source' },
        copied: { nested: { prop: 'source', another: 'source' } },
      })
      const copied = selectiveDeepExtend(['merged', 'copied'], target, source)

      expect(copied, 'They should be the same instance.').to.equal(target)
      expect(copied, 'The selected properties of the objects should be deeply merged').to.deep.equal({
        ignored: { nested: { prop: 'target' }, additional: 'target' },
        merged: { nested: { prop: 'source', additional: 'target' }, another: 'source' },
        copied: { nested: { prop: 'source', another: 'source' } },
      })
    })

    it('primitive → deep', function(): void {
      const target = {
        ignored: { nested: { prop: 'target' }, additional: 'target' },
        merged: { nested: { prop: 'target', additional: 'target' } },
      }
      const source = Object.freeze({
        ignored: 'source',
        merged: 'source',
        copied: 'source',
      })
      const copied = selectiveDeepExtend(['merged', 'copied'], target, source)

      expect(copied, 'They should be the same instance.').to.equal(target)
      expect(copied, 'The selected properties of the objects should be deeply merged').to.deep.equal({
        ignored: { nested: { prop: 'target' }, additional: 'target' },
        merged: 'source',
        copied: 'source',
      })
    })

    it('deep → primitive', function(): void {
      const target = {
        ignored: 'target',
        merged: 'target',
      }
      const source = Object.freeze({
        ignored: { nested: { prop: 'source', another: 'source' } },
        merged: { nested: { prop: 'source' }, another: 'source' },
        copied: { nested: { prop: 'source', another: 'source' } },
      })
      const copied = selectiveDeepExtend(['merged', 'copied'], target, source)

      expect(copied, 'They should be the same instance.').to.equal(target)
      expect(copied, 'The selected properties of the objects should be deeply merged').to.deep.equal({
        ignored: 'target',
        merged: { nested: { prop: 'source' }, another: 'source' },
        copied: { nested: { prop: 'source', another: 'source' } },
      })
    })
  })

  describe('arrays', function(): void {
    it('array source', function(): void {
      expect((): void => {
        selectiveDeepExtend(['prop'], {}, [])
      }).to.throw()
    })

    it('array → array', function(): void {
      const target = {
        ignored: ['target', 'target'],
        merged: ['target', 'target'],
      }
      const source = Object.freeze({
        ignored: ['source'],
        merged: ['source'],
        copied: ['source'],
      })

      expect((): void => {
        selectiveDeepExtend(['merged', 'copied'], target, source)
      }).to.throw()
    })
  })
})
