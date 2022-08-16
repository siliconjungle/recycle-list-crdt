export const spliceStr = (str, index, count, add) => {
  if (index < 0) {
    index = str.length + index
    if (index < 0) {
      index = 0
    }
  }

  return `${str.slice(0, index)}${add || ''}${str.slice(index + count)}`
}

export const deepClone = (value) => JSON.parse(JSON.stringify(value))
export const deepCompare = (value, value2) =>
  JSON.stringify(value) === JSON.stringify(value2)
