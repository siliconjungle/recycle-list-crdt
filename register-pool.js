import Map2 from './map2.js'
import lwwRegister from './lww-register.js'

// This is a place where we could add a whole bunch of runlength encoding.
const create = () => {
  return {
    registers: new Map2(),
    tombstones: new Map2(),
  }
}

const get = (pool, [agentId, seq]) => {
  return pool.registers.get(agentId, seq)
}

const add = (pool, [agentId, seq], register) => {
  pool.tombstones.delete(agentId, seq)
  pool.registers.set(agentId, seq, register)
}

const remove = (pool, [agentId, seq], version) => {
  const register = pool.registers.get(agentId, seq)
  if (register === undefined) return
  pool.tombstones.set(agentId, seq, version)
  pool.registers.delete(agentId, seq)
}

const shouldAdd = (pool, [agentId, seq], version) => {
  const register =
    pool.registers.get(agentId, seq) ?? pool.tombstones.get(agentId, seq)
  return (
    register === undefined ||
    lwwRegister.shouldRecycle(register.version, version)
  )
}

const shouldRemove = (pool, [agentId, seq], version) => {
  const register = pool.registers.get(agentId, seq)
  return (
    register !== undefined &&
    lwwRegister.shouldRemove(register.version, version)
  )
}

const has = (pool, [agentId, seq]) => pool.registers.has(agentId, seq)

const hasTombstone = (pool, agentId) => pool.tombstones.hasByKey(agentId)

const getTombstone = (pool, [agentId, seq]) => pool.tombstones.get(agentId, seq)

const getNextTombstoneUid = (pool, agentId) => {
  const seq = pool.tombstones.getFirstKeyByKey(agentId)
  return seq === undefined ? undefined : [agentId, seq]
}

export default {
  create,
  get,
  shouldAdd,
  shouldRemove,
  add,
  remove,
  getTombstone,
  getNextTombstoneUid,
  has,
  hasTombstone,
}
