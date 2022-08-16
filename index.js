import insertList from './insert-list.js'
import { spliceStr, deepClone } from './utils.js'
import registerPool from './register-pool.js'
import lwwRegister from './lww-register.js'

const agentId = 'james'
const agentId2 = 'greg'
let seq = 0

const pool = registerPool.create()
let list = insertList.create()
let values = ''

// We could hand in multiple values in here.
const createInsertOp = (pool, list, agentId, seq, index, value) => {
  const length = value.length
  const path = insertList.fromIndexToPath(list, pool, index, agentId)
  const seqs = []
  const versions = []

  for (let i = 0; i < length; i++) {
    if (registerPool.hasTombstone(pool, agentId)) {
      const uid = registerPool.getNextTombstoneUid(pool, agentId)
      const version = registerPool.getTombstone(pool, uid)
      seqs.push(uid[1])
      versions.push(version + 1)
    } else {
      seqs.push(seq)
      seq++
      versions.push(0)
    }
  }

  return {
    op: 'insert',
    agentId,
    seqs,
    versions,
    path,
    value,
  }
}

// Currently only takes a single index.
const createRemoveOp = (pool, list, index) => {
  const uid = insertList.getAtIndex(list, index)
  const register = registerPool.get(pool, uid)
  return {
    op: 'remove',
    uid,
    version: register.version,
  }
}

// Get snapshot should send all of the register info.
// This is currently un-optimised and doesn't runlength encode the registers.
const getSnapshotOps = (pool, list, values) => {
  const ops = []
  pool.registers.getEntries().forEach(([agentId, seq, register]) => {
    const index = insertList.findIndex(list, [agentId, seq])
    const value = values[index]

    ops.push({
      op: 'insert',
      agentId,
      seqs: [seq],
      versions: [register.version],
      path: register.path,
      value,
    })
  })

  pool.tombstones.getEntries().forEach(([agentId, seq, version]) => {
    ops.push({
      op: 'remove',
      uid: [agentId, seq],
      version: version,
    })
  })
  return ops
}

const applyOps = (pool, list, ops, local, values) => {
  // First thing is to filter out all the operations that should not be applied.
  // Cannot filter first, unless you cull all other operations targeting the same element.
  const filteredOps = []
  ops.forEach((op) => {
    if (op.op === 'insert') {
      // I think there is potential for this to be optimised into a single insert.
      // but we'd need to figure out if anything had been removed in between.
      // I will optimise this later.
      const { agentId, seqs, versions, path, value } = op
      const valueList = value.split('')
      let added = false
      for (let i = 0; i < seqs.length; i++) {
        const uid = [agentId, seqs[i]]
        const version = versions[i]
        if (registerPool.shouldAdd(pool, uid, version)) {
          // The path needs to have + 1 incremented to the end for each element.
          const currentPath = deepClone(path)
          currentPath[currentPath.length - 1][0] += i
          const index = insertList.getInsertIndex(list, pool, currentPath)
          insertList.insert(list, index, uid)
          registerPool.add(pool, uid, lwwRegister.create(currentPath, version))
          values = spliceStr(values, index, 0, valueList[i])
          added = true
        }
      }
      // we need a way to filter out elements or split elements out of this...
      // This will currently apply all of them even if only some of them are relevant.
      // Maybe this is ok.
      if (added) {
        filteredOps.push(op)
      }
    } else if (op.op === 'remove') {
      if (registerPool.shouldRemove(pool, op.uid, op.version)) {
        filteredOps.push(op)
        const path = registerPool.get(pool, op.uid).path
        const index = insertList.findPathIndex(list, pool, path)
        insertList.remove(list, index)
        registerPool.remove(pool, op.uid, op.version)
        values = spliceStr(values, index, 1)
      }
    }
  })
  // trigger event based on if it's local or not.
  if (local) {
    console.log('_LOCAL_', filteredOps)
  }
  return values
}

const ops = [createInsertOp(pool, list, agentId, seq, 0, 'apple pie')]

values = applyOps(pool, list, ops, true, values)
console.log('list', list)
console.log('values', values)
console.log('pool', pool)

const ops2 = [
  createRemoveOp(pool, list, 0),
  createRemoveOp(pool, list, 1),
  createRemoveOp(pool, list, 2),
  createRemoveOp(pool, list, 3),
  createRemoveOp(pool, list, 4),
  createInsertOp(pool, list, agentId2, seq, 0, 'raspberry'),
]

console.log('_OPS_2_', ops2)

values = applyOps(pool, list, ops2, true, values)
console.log('list', list)
console.log('values', values)
console.log('pool', pool)

const snapshotOps = getSnapshotOps(pool, list, values)
console.log('_SNAPSHOT_OPS_', snapshotOps)
values = applyOps(pool, list, snapshotOps, true, values)
console.log('list', list)
console.log('values', values)
console.log('pool', pool)

const pool2 = registerPool.create()
let list2 = insertList.create()
let values2 = ''
values2 = applyOps(pool2, list2, snapshotOps, true, values2)
console.log('list2', list2)
console.log('values2', values2)
console.log('pool2', pool2)
