class Map2 {
  map = new Map()
  size = 0

  get(key, key2) {
    let innerMap = this.map.get(key)
    return innerMap ? innerMap.get(key2) : undefined
  }

  set(key, key2, value) {
    let innerMap = this.map.get(key)
    if (!innerMap) {
      innerMap = new Map()
      this.map.set(key, innerMap)
    }
    this.size -= innerMap.size
    innerMap.set(key2, value)
    this.size += innerMap.size
    return this
  }

  delete(key, key2) {
    const innerMap = this.map.get(key)
    if (innerMap && innerMap.delete(key2)) {
      this.size -= 1
      if (innerMap.size === 0) {
        this.map.delete(key)
      }
      return true
    }
    return false
  }

  clear() {
    this.map.clear()
    this.size = 0
    return this
  }

  has(key, key2) {
    const innerMap = this.map.get(key)
    return innerMap ? innerMap.has(key2) : false
  }

  hasByKey(key) {
    return this.map.has(key)
  }

  getKeysByKey(key) {
    const innerMap = this.map.get(key)
    return innerMap ? innerMap.keys() : []
  }

  getValuesByKey(key) {
    const innerMap = this.map.get(key)
    return innerMap ? innerMap.values() : []
  }

  getEntriesByKey(key) {
    const innerMap = this.map.get(key)
    return innerMap ? innerMap.entries() : []
  }

  getFirstKeyByKey(key) {
    const innerMap = this.map.get(key)
    return innerMap ? innerMap.keys().next().value : undefined
  }

  getKeys() {
    const keys = []
    for (const [key, innerMap] of this.map.entries()) {
      for (const key2 of innerMap.keys()) {
        keys.push(key, key2)
      }
    }
    return keys
  }

  getValues() {
    const values = []
    for (const innerMap of this.map.values()) {
      for (const value of innerMap.values()) {
        values.push(value)
      }
    }
    return values
  }

  getEntries() {
    const entries = []
    for (const [key, innerMap] of this.map.entries()) {
      for (const [key2, value] of innerMap.entries()) {
        entries.push([key, key2, value])
      }
    }
    return entries
  }
}

export default Map2
