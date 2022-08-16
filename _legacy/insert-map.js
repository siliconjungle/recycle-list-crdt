// This handles the mapping of paths to crdts.
// We want to not only map on the path, but also map the [agentId, seq] as the version number.
// That way we can look up a crdt by path and we can also look up a crdt by [agentId, seq].
// Path: [[agentId, index], [agentId, index]]
class InsertMap {
  map = new Map()

  set(path, value) {
    this.map.set(path.flat().join('/'), value)
    return this
  }

  get(path) {
    return this.map.get(path.flat().join('/'))
  }

  delete(path) {
    this.map.delete(path.flat().join('/'))
    return this
  }

  clear() {
    this.map.clear()
    return this
  }

  has(path) {
    return this.map.has(path.flat().join('/'))
  }

  getPaths() {
    const keys = this.map.keys()
    const paths = []
    for (const key of keys) {
      const path = []
      for (let i = 0; i < fullPath.length; i += 2) {
        path.push([fullPath[i], fullPath[i + 1]])
      }
      paths.push(path)
    }
    return paths
  }

  getValues() {
    return this.map.values()
  }

  getEntries() {
    const entries = this.map.entries()
    const entries2 = []
    for (const [key, value] of entries) {
      const path = []
      for (let i = 0; i < key.length; i += 2) {
        path.push([key[i], key[i + 1]])
      }
      entries2.push([path, value])
    }
    return entries2
  }
}

export default InsertMap
