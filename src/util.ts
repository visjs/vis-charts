// utility functions

// @TODO: Million different solutions online, none works here.
import { Moment } from 'moment'
import moment from 'moment'

export { uuid4 as randomUUID } from 'vis-uuid'

// parse ASP.Net Date pattern,
// for example '/Date(1198908717056)/' or '/Date(1198908717056-0700)/'
// code from http://momentjs.com/
const ASPDateRegex = /^\/?Date\((-?\d+)/i

// Hex color
const fullHexRE = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
const shortHexRE = /^#?([a-f\d])([a-f\d])([a-f\d])$/i

/**
 * Hue, Saturation, Value.
 */
export interface HSV {
  /**
   * Hue <0, 1>.
   */
  h: number
  /**
   * Saturation <0, 1>.
   */
  s: number
  /**
   * Value <0, 1>.
   */
  v: number
}

/**
 * Red, Green, Blue.
 */
export interface RGB {
  /**
   * Red <0, 255> integer.
   */
  r: number
  /**
   * Green <0, 255> integer.
   */
  g: number
  /**
   * Blue <0, 255> integer.
   */
  b: number
}

/**
 * Red, Green, Blue, Alpha.
 */
export interface RGBA {
  /**
   * Red <0, 255> integer.
   */
  r: number
  /**
   * Green <0, 255> integer.
   */
  g: number
  /**
   * Blue <0, 255> integer.
   */
  b: number
  /**
   * Alpha <0, 1>.
   */
  a: number
}

/**
 * Test whether given object is a number
 *
 * @param value - Input value of unknown type.
 *
 * @returns True if number, false otherwise.
 */
export function isNumber(value: unknown): value is number {
  return value instanceof Number || typeof value === 'number'
}

/**
 * Remove everything in the DOM object
 *
 * @param DOMobject - Node whose child nodes will be recursively deleted.
 */
export function recursiveDOMDelete(DOMobject: Node | null | undefined): void {
  if (DOMobject) {
    while (DOMobject.hasChildNodes() === true) {
      const child = DOMobject.firstChild
      if (child) {
        recursiveDOMDelete(child)
        DOMobject.removeChild(child)
      }
    }
  }
}

/**
 * Test whether given object is a string
 *
 * @param value - Input value of unknown type.
 *
 * @returns True if string, false otherwise.
 */
export function isString(value: unknown): value is string {
  return value instanceof String || typeof value === 'string'
}

/**
 * Test whether given object is a object (not primitive or null).
 *
 * @param value - Input value of unknown type.
 *
 * @returns True if not null object, false otherwise.
 */
export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null
}

/**
 * Test whether given object is a Date, or a String containing a Date
 *
 * @param value - Input value of unknown type.
 *
 * @returns True if Date instance or string date representation, false otherwise.
 */
export function isDate(value: unknown): value is Date | string {
  if (value instanceof Date) {
    return true
  } else if (isString(value)) {
    // test whether this string contains a date
    const match = ASPDateRegex.exec(value)
    if (match) {
      return true
    } else if (!isNaN(Date.parse(value))) {
      return true
    }
  }

  return false
}

/**
 * Test whether given object is a Moment date.
 * @TODO: This is basically a workaround, if Moment was imported property it wouldn't necessary as moment.isMoment is a TS type guard.
 *
 * @param value - Input value of unknown type.
 *
 * @returns True if Moment instance, false otherwise.
 */
export function isMoment(value: unknown): value is Moment {
  return moment.isMoment(value)
}

/**
 * Copy property from b to a if property present in a.
 * If property in b explicitly set to null, delete it if `allowDeletion` set.
 *
 * Internal helper routine, should not be exported. Not added to `exports` for that reason.
 *
 * @param a - Target object.
 * @param b - Source object.
 * @param prop - Name of property to copy from b to a.
 * @param allowDeletion  if true, delete property in a if explicitly set to null in b
 */
function copyOrDelete(a: any, b: any, prop: string, allowDeletion: boolean): void {
  let doDeletion = false
  if (allowDeletion === true) {
    doDeletion = b[prop] === null && a[prop] !== undefined
  }

  if (doDeletion) {
    delete a[prop]
  } else {
    a[prop] = b[prop] // Remember, this is a reference copy!
  }
}

/**
 * Fill an object with a possibly partially defined other object.
 *
 * Only copies values for the properties already present in a.
 * That means an object is not created on a property if only the b object has it.
 *
 * @param a - The object that will have it's properties updated.
 * @param b - The object with property updates.
 * @param allowDeletion - if true, delete properties in a that are explicitly set to null in b
 */
export function fillIfDefined<T extends object>(a: T, b: Partial<T>, allowDeletion: boolean = false): void {
  // NOTE: iteration of properties of a
  // NOTE: prototype properties iterated over as well
  for (const prop in a) {
    if (b[prop] !== undefined) {
      if (b[prop] === null || typeof b[prop] !== 'object') {
        // Note: typeof null === 'object'
        copyOrDelete(a, b, prop, allowDeletion)
      } else {
        const aProp = a[prop]
        const bProp = b[prop]
        if (isObject(aProp) && isObject(bProp)) {
          fillIfDefined(aProp, bProp, allowDeletion)
        }
      }
    }
  }
}

/**
 * Copy the values of all of the enumerable own properties from one or more source objects to a
 * target object. Returns the target object.
 *
 * @param target - The target object to copy to.
 * @param source - The source object from which to copy properties.
 *
 * @return The target object.
 */
export const extend = Object.assign

/**
 * Extend object a with selected properties of object b or a series of objects
 * Only properties with defined values are copied
 *
 * @param props - Properties to be copied to a.
 * @param a - The target.
 * @param others - The sources.
 *
 * @returns Argument a.
 */
export function selectiveExtend(props: string[], a: any, ...others: any[]): any {
  if (!Array.isArray(props)) {
    throw new Error('Array with property names expected as first argument')
  }

  for (const other of others) {
    for (let p = 0; p < props.length; p++) {
      const prop = props[p]
      if (other && Object.prototype.hasOwnProperty.call(other, prop)) {
        a[prop] = other[prop]
      }
    }
  }
  return a
}

/**
 * Extend object a with selected properties of object b.
 * Only properties with defined values are copied.
 *
 * **Note:** Previous version of this routine implied that multiple source objects
 *           could be used; however, the implementation was **wrong**.
 *           Since multiple (>1) sources weren't used anywhere in the `vis.js` code,
 *           this has been removed
 *
 * @param props - Names of first-level properties to copy over.
 * @param a - Target object.
 * @param b - Source object.
 * @param allowDeletion - If true, delete property in a if explicitly set to null in b.
 *
 * @returns Argument a.
 */
export function selectiveDeepExtend(props: string[], a: any, b: any, allowDeletion: boolean = false): any {
  // TODO: add support for Arrays to deepExtend
  if (Array.isArray(b)) {
    throw new TypeError('Arrays are not supported by deepExtend')
  }

  for (let p = 0; p < props.length; p++) {
    const prop = props[p]
    if (Object.prototype.hasOwnProperty.call(b, prop)) {
      if (b[prop] && b[prop].constructor === Object) {
        if (a[prop] === undefined) {
          a[prop] = {}
        }
        if (a[prop].constructor === Object) {
          deepExtend(a[prop], b[prop], false, allowDeletion)
        } else {
          copyOrDelete(a, b, prop, allowDeletion)
        }
      } else if (Array.isArray(b[prop])) {
        throw new TypeError('Arrays are not supported by deepExtend')
      } else {
        copyOrDelete(a, b, prop, allowDeletion)
      }
    }
  }
  return a
}

/**
 * Extend object `a` with properties of object `b`, ignoring properties which are explicitly
 * specified to be excluded.
 *
 * The properties of `b` are considered for copying.
 * Properties which are themselves objects are are also extended.
 * Only properties with defined values are copied
 *
 * @param propsToExclude - Names of properties which should *not* be copied.
 * @param a - Object to extend.
 * @param b - Object to take properties from for extension.
 * @param allowDeletion - If true, delete properties in a that are explicitly set to null in b.
 *
 * @returns Argument a.
 */
export function selectiveNotDeepExtend(propsToExclude: string[], a: any, b: any, allowDeletion: boolean = false): any {
  // TODO: add support for Arrays to deepExtend
  // NOTE: array properties have an else-below; apparently, there is a problem here.
  if (Array.isArray(b)) {
    throw new TypeError('Arrays are not supported by deepExtend')
  }

  for (const prop in b) {
    if (!Object.prototype.hasOwnProperty.call(b, prop)) {
      continue
    } // Handle local properties only
    if (propsToExclude.indexOf(prop) !== -1) {
      continue
    } // In exclusion list, skip

    if (b[prop] && b[prop].constructor === Object) {
      if (a[prop] === undefined) {
        a[prop] = {}
      }
      if (a[prop].constructor === Object) {
        deepExtend(a[prop], b[prop]) // NOTE: allowDeletion not propagated!
      } else {
        copyOrDelete(a, b, prop, allowDeletion)
      }
    } else if (Array.isArray(b[prop])) {
      a[prop] = []
      for (let i = 0; i < b[prop].length; i++) {
        a[prop].push(b[prop][i])
      }
    } else {
      copyOrDelete(a, b, prop, allowDeletion)
    }
  }

  return a
}

/**
 * Deep extend an object a with the properties of object b
 *
 * @param a - Target object.
 * @param b - Source object.
 * @param protoExtend - If true, the prototype values will also be extended
 * (ie. the options objects that inherit from others will also get the inherited options).
 * @param allowDeletion - If true, the values of fields that are null will be deleted.
 *
 * @returns Argument a.
 */
export function deepExtend(a: any, b: any, protoExtend: boolean = false, allowDeletion: boolean = false): any {
  for (const prop in b) {
    if (Object.prototype.hasOwnProperty.call(b, prop) || protoExtend === true) {
      if (b[prop] && b[prop].constructor === Object) {
        if (a[prop] === undefined) {
          a[prop] = {}
        }
        if (a[prop].constructor === Object) {
          deepExtend(a[prop], b[prop], protoExtend) // NOTE: allowDeletion not propagated!
        } else {
          copyOrDelete(a, b, prop, allowDeletion)
        }
      } else if (Array.isArray(b[prop])) {
        a[prop] = []
        for (let i = 0; i < b[prop].length; i++) {
          a[prop].push(b[prop][i])
        }
      } else {
        copyOrDelete(a, b, prop, allowDeletion)
      }
    }
  }
  return a
}

/**
 * Test whether all elements in two arrays are equal.
 *
 * @param a - First array.
 * @param b - Second array.
 *
 * @returns True if both arrays have the same length and same elements (1 = '1').
 */
export function equalArray(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) {
    return false
  }

  for (let i = 0, len = a.length; i < len; i++) {
    if (a[i] != b[i]) {
      return false
    }
  }

  return true
}

export type Types =
  | 'boolean'
  | 'Boolean'
  | 'number'
  | 'Number'
  | 'string'
  | 'String'
  | 'Date'
  | 'ISODate'
  | 'ASPDate'
  | 'Moment'
export function convert<T>(object: T, type: null): T
export function convert(object: unknown, type: 'boolean' | 'Boolean'): boolean
export function convert(object: unknown, type: 'number' | 'Number'): number
export function convert(object: unknown, type: 'string' | 'String'): string
export function convert(object: unknown, type: 'Date'): Date
export function convert(object: unknown, type: 'ISODate'): string
export function convert(object: unknown, type: 'ASPDate'): string
export function convert(object: unknown, type: 'Moment'): Moment
export function convert(object: unknown, type: Types | null): any
/**
 * Convert an object into another type
 *
 * @param object - Value of unknown type.
 * @param type - Name of the desired type.
 *
 * @returns Object in the desired type.
 * @throws Error
 */
export function convert(object: unknown, type: Types | null): any {
  let match

  if (object === undefined) {
    return undefined
  }
  if (object === null) {
    return null
  }

  if (!type) {
    return object
  }
  if (!(typeof type === 'string') && !((type as any) instanceof String)) {
    throw new Error('Type must be a string')
  }

  //noinspection FallthroughInSwitchStatementJS
  switch (type) {
    case 'boolean':
    case 'Boolean':
      return Boolean(object)

    case 'number':
    case 'Number':
      if (isString(object) && !isNaN(Date.parse(object))) {
        return moment(object).valueOf()
      } else {
        // @TODO: I don't think that Number and String constructors are a good idea.
        // This could also fail if the object doesn't have valueOf method or if it's redefined.
        // For example: Object.create(null) or { valueOf: 7 }.
        return Number((object as any).valueOf())
      }
    case 'string':
    case 'String':
      return String(object)

    case 'Date':
      if (isNumber(object)) {
        return new Date(object)
      }
      if (object instanceof Date) {
        return new Date(object.valueOf())
      } else if (isMoment(object)) {
        return new Date(object.valueOf())
      }
      if (isString(object)) {
        match = ASPDateRegex.exec(object)
        if (match) {
          // object is an ASP date
          return new Date(Number(match[1])) // parse number
        } else {
          return moment(new Date(object)).toDate() // parse string
        }
      } else {
        throw new Error('Cannot convert object of type ' + getType(object) + ' to type Date')
      }

    case 'Moment':
      if (isNumber(object)) {
        return moment(object)
      }
      if (object instanceof Date) {
        return moment(object.valueOf())
      } else if (isMoment(object)) {
        return moment(object)
      }
      if (isString(object)) {
        match = ASPDateRegex.exec(object)
        if (match) {
          // object is an ASP date
          return moment(Number(match[1])) // parse number
        } else {
          return moment(object) // parse string
        }
      } else {
        throw new Error('Cannot convert object of type ' + getType(object) + ' to type Date')
      }

    case 'ISODate':
      if (isNumber(object)) {
        return new Date(object)
      } else if (object instanceof Date) {
        return object.toISOString()
      } else if (isMoment(object)) {
        return object.toDate().toISOString()
      } else if (isString(object)) {
        match = ASPDateRegex.exec(object)
        if (match) {
          // object is an ASP date
          return new Date(Number(match[1])).toISOString() // parse number
        } else {
          return moment(object).format() // ISO 8601
        }
      } else {
        throw new Error('Cannot convert object of type ' + getType(object) + ' to type ISODate')
      }

    case 'ASPDate':
      if (isNumber(object)) {
        return '/Date(' + object + ')/'
      } else if (object instanceof Date || isMoment(object)) {
        return '/Date(' + object.valueOf() + ')/'
      } else if (isString(object)) {
        match = ASPDateRegex.exec(object)
        let value
        if (match) {
          // object is an ASP date
          value = new Date(Number(match[1])).valueOf() // parse number
        } else {
          value = new Date(object).valueOf() // parse string
        }
        return '/Date(' + value + ')/'
      } else {
        throw new Error('Cannot convert object of type ' + getType(object) + ' to type ASPDate')
      }

    default:
      const never: never = type
      throw new Error(`Unknown type ${never}`)
  }
}

/**
 * Get the type of an object, for example exports.getType([]) returns 'Array'
 *
 * @param object - Input value of unknown type.
 *
 * @returns Detected type.
 */
export function getType(object: unknown): string {
  const type = typeof object

  if (type === 'object') {
    if (object === null) {
      return 'null'
    }
    if (object instanceof Boolean) {
      return 'Boolean'
    }
    if (object instanceof Number) {
      return 'Number'
    }
    if (object instanceof String) {
      return 'String'
    }
    if (Array.isArray(object)) {
      return 'Array'
    }
    if (object instanceof Date) {
      return 'Date'
    }

    return 'Object'
  }
  if (type === 'number') {
    return 'Number'
  }
  if (type === 'boolean') {
    return 'Boolean'
  }
  if (type === 'string') {
    return 'String'
  }
  if (type === undefined) {
    return 'undefined'
  }

  return type
}

export function copyAndExtendArray<T>(arr: readonly T[], newValue: T): T[]
export function copyAndExtendArray<A, V>(arr: readonly A[], newValue: V): (A | V)[]
/**
 * Used to extend an array and copy it. This is used to propagate paths recursively.
 *
 * @param arr - First part.
 * @param newValue - The value to be aadded into the array.
 *
 * @returns A new array with all items from arr and newValue (which is last).
 */
export function copyAndExtendArray<A, V>(arr: readonly A[], newValue: V): (A | V)[] {
  return [...arr, newValue]
}

/**
 * Used to extend an array and copy it. This is used to propagate paths recursively.
 *
 * @param arr - The array to be copied.
 *
 * @returns Shallow copy of arr.
 */
export function copyArray<T>(arr: readonly T[]): T[] {
  return arr.slice()
}

/**
 * Retrieve the absolute left value of a DOM element
 *
 * @param elem - A dom element, for example a div.
 *
 * @returns The absolute left position of this element in the browser page.
 */
export function getAbsoluteLeft(elem: Element): number {
  return elem.getBoundingClientRect().left
}

/**
 * Retrieve the absolute right value of a DOM element
 *
 * @param elem - A dom element, for example a div.
 *
 * @returns The absolute right position of this element in the browser page.
 */
export function getAbsoluteRight(elem: Element): number {
  return elem.getBoundingClientRect().right
}

/**
 * Retrieve the absolute top value of a DOM element
 *
 * @param elem - A dom element, for example a div.
 *
 * @returns The absolute top position of this element in the browser page.
 */
export function getAbsoluteTop(elem: Element): number {
  return elem.getBoundingClientRect().top
}

/**
 * Add a className to the given elements style.
 *
 * @param elem - The element to which the classes will be added.
 * @param classNames - Space separated list of classes.
 */
export function addClassName(elem: Element, classNames: string): void {
  let classes = elem.className.split(' ')
  const newClasses = classNames.split(' ')
  classes = classes.concat(
    newClasses.filter(function(className): boolean {
      return classes.indexOf(className) < 0
    })
  )
  elem.className = classes.join(' ')
}

/**
 * Remove a className from the given elements style.
 *
 * @param elem - The element from which the classes will be removed.
 * @param classNames - Space separated list of classes.
 */
export function removeClassName(elem: Element, classNames: string): void {
  let classes = elem.className.split(' ')
  const oldClasses = classNames.split(' ')
  classes = classes.filter(function(className): boolean {
    return oldClasses.indexOf(className) < 0
  })
  elem.className = classes.join(' ')
}

export function forEach<V>(
  array: undefined | null | V[],
  callback: (value: V, index: number, object: V[]) => void
): void
export function forEach<O extends object>(
  object: undefined | null | O,
  callback: <Key extends keyof O>(value: O[Key], key: Key, object: O) => void
): void
/**
 * For each method for both arrays and objects.
 * In case of an array, the built-in Array.forEach() is applied (**No, it's not!**).
 * In case of an Object, the method loops over all properties of the object.
 *
 * @param object - An Object or Array to be iterated over.
 * @param callback - Array.forEach-like callback.
 */
export function forEach(object: any, callback: any): void {
  if (Array.isArray(object)) {
    // array
    const len = object.length
    for (let i = 0; i < len; i++) {
      callback(object[i], i, object)
    }
  } else {
    // object
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        callback(object[key], key, object)
      }
    }
  }
}

/**
 * Convert an object into an array: all objects properties are put into the array. The resulting array is unordered.
 *
 * @param o - Object that contains the properties and methods.
 *
 * @returns An array of unordered values.
 */
export const toArray = Object.values

/**
 * Update a property in an object
 *
 * @param object - The object whose property will be updated.
 * @param key - Name of the property to be updated.
 * @param value - The new value to be assigned.
 *
 * @returns Whether the value was updated (true) or already strictly the same in the original object (false).
 */
export function updateProperty<K extends string, V>(object: Record<K, V>, key: K, value: V): boolean {
  if (object[key] !== value) {
    object[key] = value
    return true
  } else {
    return false
  }
}

/**
 * Throttle the given function to be only executed once per animation frame.
 *
 * @param fn - The original function.
 *
 * @returns The throttled function.
 */
export function throttle(fn: () => void): () => void {
  let scheduled = false

  return (): void => {
    if (!scheduled) {
      scheduled = true
      requestAnimationFrame((): void => {
        scheduled = false
        fn()
      })
    }
  }
}

/**
 * Add and event listener. Works for all browsers.
 *
 * @param element - The element to bind the event listener to.
 * @param action - Same as Element.addEventListener(action, —, —).
 * @param listener - Same as Element.addEventListener(—, listener, —).
 * @param useCapture - Same as Element.addEventListener(—, —, useCapture).
 */
export function addEventListener<E extends Element>(
  element: E,
  action: Parameters<E['addEventListener']>[0],
  listener: Parameters<E['addEventListener']>[1],
  useCapture?: Parameters<E['addEventListener']>[2]
): void {
  if (element.addEventListener) {
    if (useCapture === undefined) {
      useCapture = false
    }

    if (action === 'mousewheel' && navigator.userAgent.indexOf('Firefox') >= 0) {
      action = 'DOMMouseScroll' // For Firefox
    }

    element.addEventListener(action, listener, useCapture)
  } else {
    // @TODO: IE types? Does anyone care?
    ;(element as any).attachEvent('on' + action, listener) // IE browsers
  }
}

/**
 * Remove an event listener from an element
 *
 * @param element - The element to bind the event listener to.
 * @param action - Same as Element.removeEventListener(action, —, —).
 * @param listener - Same as Element.removeEventListener(—, listener, —).
 * @param useCapture - Same as Element.removeEventListener(—, —, useCapture).
 */
export function removeEventListener<E extends Element>(
  element: E,
  action: Parameters<E['removeEventListener']>[0],
  listener: Parameters<E['removeEventListener']>[1],
  useCapture?: Parameters<E['removeEventListener']>[2]
): void {
  if (element.removeEventListener) {
    // non-IE browsers
    if (useCapture === undefined) {
      useCapture = false
    }

    if (action === 'mousewheel' && navigator.userAgent.indexOf('Firefox') >= 0) {
      action = 'DOMMouseScroll' // For Firefox
    }

    element.removeEventListener(action, listener, useCapture)
  } else {
    // @TODO: IE types? Does anyone care?
    ;(element as any).detachEvent('on' + action, listener) // IE browsers
  }
}

/**
 * Cancels the event's default action if it is cancelable, without stopping further propagation of the event.
 *
 * @param event - The event whose default action should be prevented.
 */
export function preventDefault(event: Event | undefined): void {
  if (!event) {
    event = window.event
  }

  if (!event) {
    // No event, no work.
  } else if (event.preventDefault) {
    event.preventDefault() // non-IE browsers
  } else {
    // @TODO: IE types? Does anyone care?
    ;(event as any).returnValue = false // IE browsers
  }
}

/**
 * Get HTML element which is the target of the event.
 *
 * @param event - The event.
 *
 * @returns The element or null if not obtainable.
 */
export function getTarget(event: Event | undefined = window.event): Element | null {
  // code from http://www.quirksmode.org/js/events_properties.html
  // @TODO: EventTarget can be almost anything, is it okay to return only Elements?

  let target: null | EventTarget = null
  if (!event) {
    // No event, no target.
  } else if (event.target) {
    target = event.target
  } else if (event.srcElement) {
    target = event.srcElement
  }

  if (!(target instanceof Element)) {
    return null
  }

  if (target.nodeType != null && target.nodeType == 3) {
    // defeat Safari bug
    target = target.parentNode
    if (!(target instanceof Element)) {
      return null
    }
  }

  return target
}

/**
 * Check if given element contains given parent somewhere in the DOM tree
 *
 * @param element - The element to be tested.
 * @param parent - The ancestor (not necessarily parent) of the element.
 *
 * @returns True if parent is an ancestor of the element, false otherwise.
 */
export function hasParent(element: Element, parent: Element): boolean {
  let elem: Node = element

  while (elem) {
    if (elem === parent) {
      return true
    } else if (elem.parentNode) {
      elem = elem.parentNode
    } else {
      return false
    }
  }

  return false
}

export const option = {
  /**
   * Convert a value into a boolean.
   *
   * @param value - Value to be converted intoboolean, a function will be executed as (() => unknown).
   * @param defaultValue - If the value or the return value of the function == null then this will be returned.
   *
   * @returns Corresponding boolean value, if none then the default value, if none then null.
   */
  asBoolean(value: unknown, defaultValue?: boolean): boolean | null {
    if (typeof value == 'function') {
      value = value()
    }

    if (value != null) {
      return value != false
    }

    return defaultValue || null
  },

  /**
   * Convert a value into a number.
   *
   * @param value - Value to be converted intonumber, a function will be executed as (() => unknown).
   * @param defaultValue - If the value or the return value of the function == null then this will be returned.
   *
   * @returns Corresponding **boxed** number value, if none then the default value, if none then null.
   */
  asNumber(value: unknown, defaultValue?: number): number | null {
    if (typeof value == 'function') {
      value = value()
    }

    if (value != null) {
      return Number(value) || defaultValue || null
    }

    return defaultValue || null
  },

  /**
   * Convert a value into a string.
   *
   * @param value - Value to be converted intostring, a function will be executed as (() => unknown).
   * @param defaultValue - If the value or the return value of the function == null then this will be returned.
   *
   * @returns Corresponding **boxed** string value, if none then the default value, if none then null.
   */
  asString(value: unknown, defaultValue?: string): string | null {
    if (typeof value == 'function') {
      value = value()
    }

    if (value != null) {
      return String(value)
    }

    return defaultValue || null
  },

  /**
   * Convert a value into a size.
   *
   * @param value - Value to be converted intosize, a function will be executed as (() => unknown).
   * @param defaultValue - If the value or the return value of the function == null then this will be returned.
   *
   * @returns Corresponding string value (number + 'px'), if none then the default value, if none then null.
   */
  asSize(value: unknown, defaultValue?: string): string | null {
    if (typeof value == 'function') {
      value = value()
    }

    if (isString(value)) {
      return value
    } else if (isNumber(value)) {
      return value + 'px'
    } else {
      return defaultValue || null
    }
  },

  /**
   * Convert a value into a DOM Element.
   *
   * @param value - Value to be converted into DOM Element, a function will be executed as (() => unknown).
   * @param defaultValue - If the value or the return value of the function == null then this will be returned.
   *
   * @returns The DOM Element, if none then the default value, if none then null.
   */
  asElement<T extends Node>(value: T | (() => T | undefined) | undefined, defaultValue: T): T | null {
    if (typeof value == 'function') {
      value = value()
    }

    return value || defaultValue || null
  },
}

/**
 * Convert hex color string into RGB color object.
 * http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 *
 * @param hex - Hex color string (3 or 6 digits, with or without #).
 *
 * @returns RGB color object.
 */
export function hexToRGB(hex: string): RGB | null {
  let result
  switch (hex.length) {
    case 3:
    case 4:
      result = shortHexRE.exec(hex)
      return result
        ? {
            r: parseInt(result[1] + result[1], 16),
            g: parseInt(result[2] + result[2], 16),
            b: parseInt(result[3] + result[3], 16),
          }
        : null
    case 6:
    case 7:
      result = fullHexRE.exec(hex)
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null
    default:
      return null
  }
}

/**
 * This function takes string color in hex or RGB format and adds the opacity, RGBA is passed through unchanged.
 *
 * @param color - The color string (hex, RGB, RGBA).
 * @param opacity - The new opacity.
 *
 * @returns RGBA string, for example 'rgba(255, 0, 127, 0.3)'.
 */
export function overrideOpacity(color: string, opacity: number): string {
  if (color.indexOf('rgba') !== -1) {
    return color
  } else if (color.indexOf('rgb') !== -1) {
    const rgb = color
      .substr(color.indexOf('(') + 1)
      .replace(')', '')
      .split(',')
    return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + opacity + ')'
  } else {
    const rgb = hexToRGB(color)
    if (rgb == null) {
      return color
    } else {
      return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacity + ')'
    }
  }
}

/**
 * Convert RGB <0, 255> into hex color string.
 *
 * @param red - Red channel.
 * @param green - Green channel.
 * @param blue - Blue channel.
 *
 * @returns Hex color string (for example: '#0acdc0').
 */
export function RGBToHex(red: number, green: number, blue: number): string {
  return '#' + ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)
}

export interface ColorObject {
  background?: string
  border?: string
  hover?: {
    border?: string
    background?: string
  }
  highlight?: {
    border?: string
    background?: string
  }
}
export interface FullColorObject {
  background: string
  border: string
  hover: {
    border: string
    background: string
  }
  highlight: {
    border: string
    background: string
  }
}

export function parseColor(inputColor: string): FullColorObject
export function parseColor(inputColor: ColorObject): ColorObject
export function parseColor(inputColor: ColorObject | string, defaultColor: FullColorObject): FullColorObject
/**
 * Parse a color property into an object with border, background, and highlight colors
 *
 * @param inputColor - Shorthand color string or input color object.
 * @param defaultColor - Full color object to fill in missing values in inputColor.
 *
 * @returns Color object.
 */
export function parseColor(
  inputColor: ColorObject | string,
  defaultColor?: FullColorObject
): ColorObject | FullColorObject {
  if (isString(inputColor)) {
    let colorStr: string = inputColor
    if (isValidRGB(colorStr)) {
      const rgb = colorStr
        .substr(4)
        .substr(0, colorStr.length - 5)
        .split(',')
        .map(function(value): number {
          return parseInt(value)
        })
      colorStr = RGBToHex(rgb[0], rgb[1], rgb[2])
    }
    if (isValidHex(colorStr) === true) {
      const hsv = hexToHSV(colorStr)
      const lighterColorHSV = {
        h: hsv.h,
        s: hsv.s * 0.8,
        v: Math.min(1, hsv.v * 1.02),
      }
      const darkerColorHSV = {
        h: hsv.h,
        s: Math.min(1, hsv.s * 1.25),
        v: hsv.v * 0.8,
      }
      const darkerColorHex = HSVToHex(darkerColorHSV.h, darkerColorHSV.s, darkerColorHSV.v)
      const lighterColorHex = HSVToHex(lighterColorHSV.h, lighterColorHSV.s, lighterColorHSV.v)
      return {
        background: colorStr,
        border: darkerColorHex,
        highlight: {
          background: lighterColorHex,
          border: darkerColorHex,
        },
        hover: {
          background: lighterColorHex,
          border: darkerColorHex,
        },
      }
    } else {
      return {
        background: colorStr,
        border: colorStr,
        highlight: {
          background: colorStr,
          border: colorStr,
        },
        hover: {
          background: colorStr,
          border: colorStr,
        },
      }
    }
  } else {
    if (defaultColor) {
      const color: FullColorObject = {
        background: inputColor.background || defaultColor.background,
        border: inputColor.border || defaultColor.border,
        highlight: isString(inputColor.highlight)
          ? {
              border: inputColor.highlight,
              background: inputColor.highlight,
            }
          : {
              background:
                (inputColor.highlight && inputColor.highlight.background) || defaultColor.highlight.background,
              border: (inputColor.highlight && inputColor.highlight.border) || defaultColor.highlight.border,
            },
        hover: isString(inputColor.hover)
          ? {
              border: inputColor.hover,
              background: inputColor.hover,
            }
          : {
              border: (inputColor.hover && inputColor.hover.border) || defaultColor.hover.border,
              background: (inputColor.hover && inputColor.hover.background) || defaultColor.hover.background,
            },
      }
      return color
    } else {
      const color: ColorObject = {
        background: inputColor.background || undefined,
        border: inputColor.border || undefined,
        highlight: isString(inputColor.highlight)
          ? {
              border: inputColor.highlight,
              background: inputColor.highlight,
            }
          : {
              background: (inputColor.highlight && inputColor.highlight.background) || undefined,
              border: (inputColor.highlight && inputColor.highlight.border) || undefined,
            },
        hover: isString(inputColor.hover)
          ? {
              border: inputColor.hover,
              background: inputColor.hover,
            }
          : {
              border: (inputColor.hover && inputColor.hover.border) || undefined,
              background: (inputColor.hover && inputColor.hover.background) || undefined,
            },
      }
      return color
    }
  }
}

/**
 * Convert RGB <0, 255> into HSV object.
 * http://www.javascripter.net/faq/rgb2hsv.htm
 *
 * @param red - Red channel.
 * @param green - Green channel.
 * @param blue - Blue channel.
 *
 * @returns HSV color object.
 */
export function RGBToHSV(red: number, green: number, blue: number): HSV {
  red = red / 255
  green = green / 255
  blue = blue / 255
  const minRGB = Math.min(red, Math.min(green, blue))
  const maxRGB = Math.max(red, Math.max(green, blue))

  // Black-gray-white
  if (minRGB === maxRGB) {
    return { h: 0, s: 0, v: minRGB }
  }

  // Colors other than black-gray-white:
  const d = red === minRGB ? green - blue : blue === minRGB ? red - green : blue - red
  const h = red === minRGB ? 3 : blue === minRGB ? 1 : 5
  const hue = (60 * (h - d / (maxRGB - minRGB))) / 360
  const saturation = (maxRGB - minRGB) / maxRGB
  const value = maxRGB
  return { h: hue, s: saturation, v: value }
}

interface CSSStyles {
  [key: string]: string
}
const cssUtil = {
  // split a string with css styles into an object with key/values
  split(cssText: string): CSSStyles {
    const styles: CSSStyles = {}

    cssText.split(';').forEach((style): void => {
      if (style.trim() != '') {
        const parts = style.split(':')
        const key = parts[0].trim()
        const value = parts[1].trim()
        styles[key] = value
      }
    })

    return styles
  },

  // build a css text string from an object with key/values
  join(styles: CSSStyles): string {
    return Object.keys(styles)
      .map(function(key): string {
        return key + ': ' + styles[key]
      })
      .join('; ')
  },
}

/**
 * Append a string with css styles to an element
 *
 * @param element - The element that will receive new styles.
 * @param cssText - The styles to be appended.
 */
export function addCssText(element: HTMLElement, cssText: string): void {
  const currentStyles = cssUtil.split(element.style.cssText)
  const newStyles = cssUtil.split(cssText)
  const styles = {
    ...currentStyles,
    ...newStyles,
  }

  element.style.cssText = cssUtil.join(styles)
}

/**
 * Remove a string with css styles from an element
 *
 * @param element - The element from which styles should be removed.
 * @param cssText - The styles to be removed.
 */
export function removeCssText(element: HTMLElement, cssText: string): void {
  const styles = cssUtil.split(element.style.cssText)
  const removeStyles = cssUtil.split(cssText)

  for (const key in removeStyles) {
    if (Object.prototype.hasOwnProperty.call(removeStyles, key)) {
      delete styles[key]
    }
  }

  element.style.cssText = cssUtil.join(styles)
}

/**
 * Convert HSV <0, 1> into RGB color object.
 * https://gist.github.com/mjijackson/5311256
 *
 * @param h - Hue
 * @param s - Saturation
 * @param v - Value
 *
 * @returns RGB color object.
 */
export function HSVToRGB(h: number, s: number, v: number): RGB {
  let r: undefined | number
  let g: undefined | number
  let b: undefined | number

  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0:
      ;(r = v), (g = t), (b = p)
      break
    case 1:
      ;(r = q), (g = v), (b = p)
      break
    case 2:
      ;(r = p), (g = v), (b = t)
      break
    case 3:
      ;(r = p), (g = q), (b = v)
      break
    case 4:
      ;(r = t), (g = p), (b = v)
      break
    case 5:
      ;(r = v), (g = p), (b = q)
      break
  }

  return {
    r: Math.floor((r as number) * 255),
    g: Math.floor((g as number) * 255),
    b: Math.floor((b as number) * 255),
  }
}

/**
 * Convert HSV <0, 1> into hex color string.
 *
 * @param h - Hue
 * @param s - Saturation
 * @param v - Value
 *
 * @returns Hex color string.
 */
export function HSVToHex(h: number, s: number, v: number): string {
  const rgb = HSVToRGB(h, s, v)
  return RGBToHex(rgb.r, rgb.g, rgb.b)
}

/**
 * Convert hex color string into HSV <0, 1>.
 *
 * @param hex - Hex color string.
 *
 * @returns HSV color object.
 */
export function hexToHSV(hex: string): HSV {
  const rgb = hexToRGB(hex)
  if (!rgb) {
    throw new TypeError(`'${hex}' is not a valid color.`)
  }
  return RGBToHSV(rgb.r, rgb.g, rgb.b)
}

/**
 * Validate hex color string.
 *
 * @param hex - Unknown string that may contain a color.
 *
 * @returns True if the string is valid, false otherwise.
 */
export function isValidHex(hex: string): boolean {
  const isOk = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hex)
  return isOk
}

/**
 * Validate RGB color string.
 *
 * @param rgb - Unknown string that may contain a color.
 *
 * @returns True if the string is valid, false otherwise.
 */
export function isValidRGB(rgb: string): boolean {
  rgb = rgb.replace(' ', '')
  const isOk = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/i.test(rgb)
  return isOk
}

/**
 * Validate RGBA color string.
 *
 * @param rgba - Unknown string that may contain a color.
 *
 * @returns True if the string is valid, false otherwise.
 */
export function isValidRGBA(rgba: string): boolean {
  rgba = rgba.replace(' ', '')
  const isOk = /rgba\((\d{1,3}),(\d{1,3}),(\d{1,3}),(0?.{1,3})\)/i.test(rgba)
  return isOk
}

/**
 * This recursively redirects the prototype of JSON objects to the referenceObject.
 * This is used for default options.
 *
 * @param fields - Names of properties to be bridged.
 * @param referenceObject - The original object.
 *
 * @returns A new object inheriting from the referenceObject.
 */
export function selectiveBridgeObject<F extends string, V>(
  fields: F[],
  referenceObject: Record<F, V>
): Record<F, V> | null {
  if (referenceObject !== null && typeof referenceObject === 'object') {
    // !!! typeof null === 'object'
    const objectTo = Object.create(referenceObject)
    for (let i = 0; i < fields.length; i++) {
      if (Object.prototype.hasOwnProperty.call(referenceObject, fields[i])) {
        if (typeof referenceObject[fields[i]] == 'object') {
          objectTo[fields[i]] = bridgeObject(referenceObject[fields[i]])
        }
      }
    }
    return objectTo
  } else {
    return null
  }
}

export function bridgeObject<T extends object>(referenceObject: T): T
export function bridgeObject<T>(referenceObject: T): null
/**
 * This recursively redirects the prototype of JSON objects to the referenceObject.
 * This is used for default options.
 *
 * @param referenceObject - The original object.
 *
 * @returns The Element if the referenceObject is an Element, or a new object inheriting from the referenceObject.
 */
export function bridgeObject<T extends object | null>(referenceObject: T): T | null {
  if (referenceObject === null || typeof referenceObject !== 'object') {
    return null
  }

  if (referenceObject instanceof Element) {
    // Avoid bridging DOM objects
    return referenceObject
  }

  const objectTo = Object.create(referenceObject)
  for (const i in referenceObject) {
    if (Object.prototype.hasOwnProperty.call(referenceObject, i)) {
      if (typeof (referenceObject as any)[i] == 'object') {
        objectTo[i] = bridgeObject((referenceObject as any)[i])
      }
    }
  }

  return objectTo
}

/**
 * This method provides a stable sort implementation, very fast for presorted data.
 *
 * @param a - The array to be sorted (in-place).
 * @param compare - An order comparator.
 *
 * @returns The argument a.
 */
export function insertSort<T>(a: T[], compare: (a: T, b: T) => number): T[] {
  for (let i = 0; i < a.length; i++) {
    const k = a[i]
    let j
    for (j = i; j > 0 && compare(k, a[j - 1]) < 0; j--) {
      a[j] = a[j - 1]
    }
    a[j] = k
  }
  return a
}

/**
 * This is used to set the options of subobjects in the options object.
 *
 * A requirement of these subobjects is that they have an 'enabled' element
 * which is optional for the user but mandatory for the program.
 *
 * The added value here of the merge is that option 'enabled' is set as required.
 *
 * @param mergeTarget - Either this.options or the options used for the groups.
 * @param options - Options.
 * @param option - Option key in the options argument.
 * @param globalOptions - Global options, passed in to determine value of option 'enabled'.
 */
export function mergeOptions(mergeTarget: any, options: any, option: string, globalOptions: any = {}): void {
  // Local helpers
  const isPresent = function(obj: any): boolean {
    return obj !== null && obj !== undefined
  }

  const isObject = function(obj: unknown): boolean {
    return obj !== null && typeof obj === 'object'
  }

  // https://stackoverflow.com/a/34491287/1223531
  const isEmpty = function(obj: object): obj is {} {
    for (const x in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, x)) {
        return false
      }
    }
    return true
  }

  // Guards
  if (!isObject(mergeTarget)) {
    throw new Error('Parameter mergeTarget must be an object')
  }

  if (!isObject(options)) {
    throw new Error('Parameter options must be an object')
  }

  if (!isPresent(option)) {
    throw new Error('Parameter option must have a value')
  }

  if (!isObject(globalOptions)) {
    throw new Error('Parameter globalOptions must be an object')
  }

  //
  // Actual merge routine, separated from main logic
  // Only a single level of options is merged. Deeper levels are ref'd. This may actually be an issue.
  //
  const doMerge = function(target: any, options: any, option: string): void {
    if (!isObject(target[option])) {
      target[option] = {}
    }

    const src = options[option]
    const dst = target[option]
    for (const prop in src) {
      if (Object.prototype.hasOwnProperty.call(src, prop)) {
        dst[prop] = src[prop]
      }
    }
  }

  // Local initialization
  const srcOption = options[option]
  const globalPassed = isObject(globalOptions) && !isEmpty(globalOptions)
  const globalOption = globalPassed ? globalOptions[option] : undefined
  const globalEnabled = globalOption ? globalOption.enabled : undefined

  /////////////////////////////////////////
  // Main routine
  /////////////////////////////////////////
  if (srcOption === undefined) {
    return // Nothing to do
  }

  if (typeof srcOption === 'boolean') {
    if (!isObject(mergeTarget[option])) {
      mergeTarget[option] = {}
    }

    mergeTarget[option].enabled = srcOption
    return
  }

  if (srcOption === null && !isObject(mergeTarget[option])) {
    // If possible, explicit copy from globals
    if (isPresent(globalOption)) {
      mergeTarget[option] = Object.create(globalOption)
    } else {
      return // Nothing to do
    }
  }

  if (!isObject(srcOption)) {
    return
  }

  //
  // Ensure that 'enabled' is properly set. It is required internally
  // Note that the value from options will always overwrite the existing value
  //
  let enabled = true // default value

  if (srcOption.enabled !== undefined) {
    enabled = srcOption.enabled
  } else {
    // Take from globals, if present
    if (globalEnabled !== undefined) {
      enabled = globalOption.enabled
    }
  }

  doMerge(mergeTarget, options, option)
  mergeTarget[option].enabled = enabled
}

export function binarySearchCustom<O extends object, K1 extends keyof O, K2 extends keyof O[K1]>(
  orderedItems: O[],
  comparator: (v: O[K1][K2]) => -1 | 0 | 1,
  field: K1,
  field2: K2
): number
export function binarySearchCustom<O extends object, K1 extends keyof O>(
  orderedItems: O[],
  comparator: (v: O[K1]) => -1 | 0 | 1,
  field: K1
): number
/**
 * This function does a binary search for a visible item in a sorted list. If we find a visible item, the code that uses
 * this function will then iterate in both directions over this sorted list to find all visible items.
 *
 * @param orderedItems - Items ordered by start
 * @param comparator - -1 is lower, 0 is equal, 1 is higher
 * @param field - Property name on an item (i.e. item[field]).
 * @param field2 - Second property name on an item (i.e. item[field][field2]).
 *
 * @returns Index of the found item or -1 if nothing was found.
 */
export function binarySearchCustom(
  orderedItems: any[],
  comparator: (v: unknown) => -1 | 0 | 1,
  field: string,
  field2?: string
): number {
  const maxIterations = 10000
  let iteration = 0
  let low = 0
  let high = orderedItems.length - 1

  while (low <= high && iteration < maxIterations) {
    const middle = Math.floor((low + high) / 2)

    const item = orderedItems[middle]
    const value = field2 === undefined ? item[field] : item[field][field2]

    const searchResult = comparator(value)
    if (searchResult == 0) {
      // jihaa, found a visible item!
      return middle
    } else if (searchResult == -1) {
      // it is too small --> increase low
      low = middle + 1
    } else {
      // it is too big --> decrease high
      high = middle - 1
    }

    iteration++
  }

  return -1
}

/**
 * This function does a binary search for a specific value in a sorted array. If it does not exist but is in between of
 * two values, we return either the one before or the one after, depending on user input
 * If it is found, we return the index, else -1.
 *
 * @param orderedItems - Sorted array.
 * @param target - The searched value.
 * @param field - Name of the property in items to be searched.
 * @param sidePreference - If the target is between two values, should the index of the before or the after be returned?
 * @param comparator - An optional comparator, returning -1, 0, 1 for <, ===, >.
 *
 * @returns The index of found value or -1 if nothing was found.
 */
export function binarySearchValue<T extends string>(
  orderedItems: { [K in T]: number }[],
  target: number,
  field: T,
  sidePreference: 'before' | 'after',
  comparator?: (a: number, b: number) => -1 | 0 | 1
): number {
  const maxIterations = 10000
  let iteration = 0
  let low = 0
  let high = orderedItems.length - 1
  let prevValue
  let value
  let nextValue
  let middle

  comparator =
    comparator != undefined
      ? comparator
      : function(a: number, b: number): -1 | 0 | 1 {
          return a == b ? 0 : a < b ? -1 : 1
        }

  while (low <= high && iteration < maxIterations) {
    // get a new guess
    middle = Math.floor(0.5 * (high + low))
    prevValue = orderedItems[Math.max(0, middle - 1)][field]
    value = orderedItems[middle][field]
    nextValue = orderedItems[Math.min(orderedItems.length - 1, middle + 1)][field]

    if (comparator(value, target) == 0) {
      // we found the target
      return middle
    } else if (comparator(prevValue, target) < 0 && comparator(value, target) > 0) {
      // target is in between of the previous and the current
      return sidePreference == 'before' ? Math.max(0, middle - 1) : middle
    } else if (comparator(value, target) < 0 && comparator(nextValue, target) > 0) {
      // target is in between of the current and the next
      return sidePreference == 'before' ? middle : Math.min(orderedItems.length - 1, middle + 1)
    } else {
      // didnt find the target, we need to change our boundaries.
      if (comparator(value, target) < 0) {
        // it is too small --> increase low
        low = middle + 1
      } else {
        // it is too big --> decrease high
        high = middle - 1
      }
    }
    iteration++
  }

  // didnt find anything. Return -1.
  return -1
}

/*
 * Easing Functions.
 * Only considering the t value for the range [0, 1] => [0, 1].
 *
 * Inspiration: from http://gizma.com/easing/
 * https://gist.github.com/gre/1650294
 */
export const easingFunctions = {
  /**
   * no easing, no acceleration
   *
   * @param t - Time.
   *
   * @returns Value at time t.
   */
  linear(t: number): number {
    return t
  },

  /**
   * accelerating from zero velocity
   *
   * @param t - Time.
   *
   * @returns Value at time t.
   */
  easeInQuad(t: number): number {
    return t * t
  },

  /**
   * decelerating to zero velocity
   *
   * @param t - Time.
   *
   * @returns Value at time t.
   */
  easeOutQuad(t: number): number {
    return t * (2 - t)
  },

  /**
   * acceleration until halfway, then deceleration
   *
   * @param t - Time.
   *
   * @returns Value at time t.
   */
  easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  },

  /**
   * accelerating from zero velocity
   *
   * @param t - Time.
   *
   * @returns Value at time t.
   */
  easeInCubic(t: number): number {
    return t * t * t
  },

  /**
   * decelerating to zero velocity
   *
   * @param t - Time.
   *
   * @returns Value at time t.
   */
  easeOutCubic(t: number): number {
    return --t * t * t + 1
  },

  /**
   * acceleration until halfway, then deceleration
   *
   * @param t - Time.
   *
   * @returns Value at time t.
   */
  easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  },

  /**
   * accelerating from zero velocity
   *
   * @param t - Time.
   *
   * @returns Value at time t.
   */
  easeInQuart(t: number): number {
    return t * t * t * t
  },

  /**
   * decelerating to zero velocity
   *
   * @param t - Time.
   *
   * @returns Value at time t.
   */
  easeOutQuart(t: number): number {
    return 1 - --t * t * t * t
  },

  /**
   * acceleration until halfway, then deceleration
   *
   * @param t - Time.
   *
   * @returns Value at time t.
   */
  easeInOutQuart(t: number): number {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t
  },

  /**
   * accelerating from zero velocity
   *
   * @param t - Time.
   *
   * @returns Value at time t.
   */
  easeInQuint(t: number): number {
    return t * t * t * t * t
  },

  /**
   * decelerating to zero velocity
   *
   * @param t - Time.
   *
   * @returns Value at time t.
   */
  easeOutQuint(t: number): number {
    return 1 + --t * t * t * t * t
  },

  /**
   * acceleration until halfway, then deceleration
   *
   * @param t - Time.
   *
   * @returns Value at time t.
   */
  easeInOutQuint(t: number): number {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
  },
}

/**
 * Experimentaly compute the width of the scrollbar for this browser.
 *
 * @returns The width in pixels.
 */
export function getScrollBarWidth(): number {
  const inner = document.createElement('p')
  inner.style.width = '100%'
  inner.style.height = '200px'

  const outer = document.createElement('div')
  outer.style.position = 'absolute'
  outer.style.top = '0px'
  outer.style.left = '0px'
  outer.style.visibility = 'hidden'
  outer.style.width = '200px'
  outer.style.height = '150px'
  outer.style.overflow = 'hidden'
  outer.appendChild(inner)

  document.body.appendChild(outer)
  const w1 = inner.offsetWidth
  outer.style.overflow = 'scroll'
  let w2 = inner.offsetWidth
  if (w1 == w2) {
    w2 = outer.clientWidth
  }

  document.body.removeChild(outer)

  return w1 - w2
}

// @TODO: This doesn't work properly.
// It works only for single property objects,
// otherwise it combines all of the types in a union.
// export function topMost<K1 extends string, V1> (
//   pile: Record<K1, undefined | V1>[],
//   accessors: K1 | [K1]
// ): undefined | V1
// export function topMost<K1 extends string, K2 extends string, V1, V2> (
//   pile: Record<K1, undefined | V1 | Record<K2, undefined | V2>>[],
//   accessors: [K1, K2]
// ): undefined | V1 | V2
// export function topMost<K1 extends string, K2 extends string, K3 extends string, V1, V2, V3> (
//   pile: Record<K1, undefined | V1 | Record<K2, undefined | V2 | Record<K3, undefined | V3>>>[],
//   accessors: [K1, K2, K3]
// ): undefined | V1 | V2 | V3
/**
 * Get the top most property value from a pile of objects.
 *
 * @param pile - Array of objects, no required format.
 * @param accessors - Array of property names (e.g. object['foo']['bar'] → ['foo', 'bar']).
 *
 * @returns Value of the property with given accessors path from the first pile item where it's not undefined.
 */
export function topMost(pile: any, accessors: any): any {
  let candidate
  if (!Array.isArray(accessors)) {
    accessors = [accessors]
  }
  for (const member of pile) {
    if (member) {
      candidate = member[accessors[0]]
      for (let i = 1; i < accessors.length; i++) {
        if (candidate) {
          candidate = candidate[accessors[i]]
        }
      }
      if (typeof candidate !== 'undefined') {
        break
      }
    }
  }
  return candidate
}
