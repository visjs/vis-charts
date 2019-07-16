import { expect } from 'chai'

import { copyArray } from '../src'

describe('copyArray', function(): void {
  it('number[]', function(): void {
    const original = Object.freeze([-77, 14, 78])
    const copied = copyArray(original)

    expect(copied, 'Their content should be the same.').to.deep.equal(original)
    expect(copied, 'They should be different instances.').to.not.equal(original)
  })

  it('object[]', function(): void {
    const original = Object.freeze([{ hi: ':-)' }, { bye: ':-(' }])
    const copied = copyArray(original)

    expect(copied, 'They should be different instances.').to.not.equal(original)
    expect(copied[0], 'The objects should be copied by reference').to.equal(original[0])
    expect(copied[1], 'The objects should be copied by reference').to.equal(original[1])
  })
})
