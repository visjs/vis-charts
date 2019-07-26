import { expect } from 'chai'

import { copyAndExtendArray } from '../src'

describe('copyAndExtendArray', function(): void {
  it('number[]', function(): void {
    const original = Object.freeze([-77, 14, 78])
    const addition = Object.freeze(0)
    const copied = copyAndExtendArray(original, addition)

    expect(copied, 'They should be different instances.').to.not.equal(original)
    expect(copied, 'All elements should be in the new array and in the right order.').to.deep.equal([-77, 14, 78, 0])
  })

  it('object[]', function(): void {
    const original = Object.freeze([Object.freeze({ hi: ':-)' }), Object.freeze({ bye: ':-(' })])
    const addition = Object.freeze({ hello: '☺' })
    const copied = copyAndExtendArray(original, addition)

    expect(copied, 'They should be different instances.').to.not.equal(original)

    expect(copied[0], 'The objects should be copied by reference').to.equal(original[0])
    expect(copied[1], 'The objects should be copied by reference').to.equal(original[1])
    expect(copied[2], 'The objects should be copied by reference').to.equal(addition)
  })
})
