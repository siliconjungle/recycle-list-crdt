// Crdt version is only incremented when you recycle a crdt.
// Path gets updated and value gets reset.
// null tie-breaks all other values.
const create = (path, version = 0) => ({
  version,
  path,
})

const shouldRecycle = (version, version2) => version2 > version

const shouldRemove = (version, version2) => version2 >= version

export default {
  create,
  shouldRecycle,
  shouldRemove,
}
