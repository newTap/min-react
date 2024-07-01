export const isFunction = (val) => typeof val === 'function'
export const isArray = (val) => Array.isArray(val)
export const textFilter = (val) => {
  if (val === undefined || val === null || typeof val === 'boolean') {
    return ''
  }
  return val
}
