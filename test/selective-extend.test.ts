import { expect } from 'chai'

import { selectiveExtend } from '../src'

describe('selectiveExtend', function(): void {
  it('non-array property names', function(): void {
    expect((): void => {
      selectiveExtend('prop' as any, {}, {})
    }).to.throw()
  })

  it('copy 1 ignore 1', function(): void {
    const target = { hi: ':-)' }
    const source = Object.freeze({ hi: ':-( 1', bye: ':-) 1' })
    const copied = selectiveExtend(['bye'], target, source)

    expect(copied, 'They should be the same instance.').to.equal(target)
    expect(copied, 'The selected properties should be copied by reference').to.deep.equal({
      hi: ':-)',
      bye: ':-) 1',
    })
  })

  it('2 sources, copy 1 ignore 1', function(): void {
    const target = { hi: ':-)' }
    const source1 = Object.freeze({ hi: ':-( 1', bye: ':-) 1' })
    const source2 = Object.freeze({ hi: ':-( 2', bye: ':-) 2' })
    const copied = selectiveExtend(['bye'], target, source1, source2)

    expect(copied, 'They should be the same instance.').to.equal(target)
    expect(copied, 'The selected properties should be copied by reference').to.deep.equal({
      hi: ':-)',
      bye: ':-) 2',
    })
  })

  it('3 sources, copy 2 ignore 1', function(): void {
    const target = { hi: ':-)' }
    const source1 = Object.freeze({ hi: ':-( 1', bye: ':-) 1' })
    const source2 = Object.freeze({ hi: ':-( 2', bye: ':-) 2', hello: ':-) 2' })
    const source3 = Object.freeze({ hi: ':-( 3', bye: ':-) 3' })
    const copied = selectiveExtend(['bye', 'hello'], target, source1, source2, source3)

    expect(copied, 'They should be the same instance.').to.equal(target)
    expect(copied, 'The selected properties should be copied by reference').to.deep.equal({
      hi: ':-)',
      hello: ':-) 2',
      bye: ':-) 3',
    })
  })
})
