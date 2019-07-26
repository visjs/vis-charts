import { assert, spy } from 'sinon'

import { forEach } from '../src'

describe('forEach', function(): void {
  it('Array', function(): void {
    const forEachSpy = spy()
    const array = [-1, 0, 1]

    forEach(array, forEachSpy)

    assert.calledWithExactly(forEachSpy.firstCall, -1, 0, array)
    assert.calledWithExactly(forEachSpy.secondCall, 0, 1, array)
    assert.calledWithExactly(forEachSpy.thirdCall, 1, 2, array)
    assert.callCount(forEachSpy, 3)
  })

  it('Object', function(): void {
    const forEachSpy = spy()
    const objectProto = {
      ignore: 'me',
    }
    const object = Object.create(objectProto)
    object.a = -1
    object.b = 0
    object.c = 1

    forEach(object, forEachSpy)

    assert.calledWithExactly(forEachSpy, -1, 'a', object)
    assert.calledWithExactly(forEachSpy, 0, 'b', object)
    assert.calledWithExactly(forEachSpy, 1, 'c', object)
    assert.neverCalledWith(forEachSpy, 'me', 'ignore', object)
    assert.callCount(forEachSpy, 3)
  })
})
