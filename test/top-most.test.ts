import { expect } from 'chai'

import { topMost } from '../src'

describe('topMost', function(): void {
  it('Single level, first object', function(): void {
    const pile = [{ theValue: 'It‘s me :-).' }, { theValue: 'Nobody cares about me :-(.' }]

    expect(topMost(pile, ['theValue'])).to.equal('It‘s me :-).')
    expect(topMost(pile, 'theValue'), 'String accessor should be accepted too.').to.equal('It‘s me :-).')
  })

  it('Single level, middle object', function(): void {
    const pile = [
      { foo: 'Move along, I don‘t have it.' },
      { theValue: 'It‘s me :-).' },
      { theValue: 'Nobody cares about me :-(.' },
    ]

    expect(topMost(pile, ['theValue'])).to.equal('It‘s me :-).')
    expect(topMost(pile, 'theValue'), 'String accessor should be accepted too.').to.equal('It‘s me :-).')
  })

  it('Nested objects', function(): void {
    const pile = [
      {},
      { foo: {} },
      { foo: { bar: {} } },
      { foo: { bar: { theValue: 'It‘s finally me :-).' } } },
      { foo: { bar: { theValue: 'Nobody cares about me :-(.' } } },
    ]

    expect(topMost(pile, ['foo', 'bar', 'theValue'])).to.equal('It‘s finally me :-).')
  })

  it.skip('Nested objects and primitives', function(): void {
    // @TODO: This doesn't work, but I think it should work.
    // Any other opinions about it?
    const pile = [
      undefined,
      null,
      true,
      {},
      { foo: null },
      { foo: {} },
      { foo: { bar: 77 } },
      { foo: { bar: {} } },
      { foo: { bar: { theValue: 'It‘s finally me :-).' } } },
      { foo: { bar: { theValue: 'Nobody cares about me :-(.' } } },
    ]

    expect(topMost(pile, ['foo', 'bar', 'theValue'])).to.equal('It‘s finally me :-).')
  })
})
