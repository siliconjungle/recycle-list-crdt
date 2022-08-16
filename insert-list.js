import registerPool from './register-pool.js'
import { deepClone, deepCompare } from './utils.js'

// This handles the order for each of the paths.
const create = () => []

const getAtIndex = (list, index) => {
  if (index < 0 || index >= list.length) {
    throw new Error(`Index out of bounds: ${index}`)
  }
  return list[index]
}

const findPathIndex = (list, pool, path) => {
  return list.findIndex((uid) => {
    const path2 = registerPool.get(pool, uid).path
    return deepCompare(path, path2)
  })
}

const findIndex = (list, uid) => {
  return list.findIndex((uid2) => deepCompare(uid, uid2))
}

const includes = (list, pool, path) => findIndex(list, pool, path) !== -1

const pathParentsMatch = (path, path2) => {
  const pathClone = deepClone(path)
  pathClone.pop()
  const path2Clone = deepClone(path2)
  path2Clone.pop()
  return deepCompare(pathClone, path2Clone)
}

const fromIndexToPath = (list, pool, index, agentId) => {
  if (index === -1 || index > list.length) {
    throw new Error('Index out of bounds')
  }
  const prevUid = list[index - 1]
  const nextUid = list[index]

  if (!prevUid && !nextUid) {
    return [[0, agentId]]
  }

  // If there is no previous and no next then it is the first element.
  if (!prevUid) {
    // Inserting before the first element.
    const nextPath = registerPool.get(pool, nextUid).path
    const path = deepClone(nextPath)
    path.push([0, agentId])
    return path
  } else if (!nextUid) {
    // Inserting after the last element.
    const prevPath = registerPool.get(pool, prevUid).path
    const path = deepClone(prevPath)
    const lastIndex = path[path.length - 1][0]
    path[path.length - 1] = [lastIndex + 1, agentId]
    return path
  } else {
    // Inserting between two elements.
    // Need to check if the left and the right elements are on the same layer or a different layer.
    // They are only the same if all the elements in the path are the same except for the last one.
    const prevPath = registerPool.get(pool, prevUid).path
    const nextPath = registerPool.get(pool, nextUid).path
    if (pathParentsMatch(prevPath, nextPath)) {
      // They are on the same layer.
      const path = deepClone(nextPath)
      path.push([0, agentId])
      return path
    } else {
      // They are on different layers.
      const path = deepClone(prevPath)
      const lastIndex = path[path.length - 1][0]
      path[path.length - 1] = [lastIndex + 1, agentId]
      return path
    }
  }
}

const getInsertIndex = (list, pool, path) => {
  if (list.length === 0) {
    return 0
  }

  const index = list.findIndex((uid) => {
    const path2 = registerPool.get(pool, uid).path
    for (let i = 0; i < path2.length; i++) {
      if (i > path.length - 1) {
        return false
      }
      const [index, agentId] = path[i]
      const [index2, agentId2] = path2[i]
      return index2 > index || (index2 === index && agentId2 > agentId)
    }
  })

  if (index === -1) {
    return list.length
  }

  return index
}

const insert = (list, insertIndex, uid) => {
  list.splice(insertIndex, 0, uid)
}

const remove = (list, insertIndex) => {
  list.splice(insertIndex, 1)
}

export default {
  create,
  findIndex,
  includes,
  getInsertIndex,
  fromIndexToPath,
  findPathIndex,
  findIndex,
  insert,
  remove,
  getAtIndex,
}
