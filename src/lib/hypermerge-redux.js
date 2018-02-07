import { is } from "immutable";

export default (sync, {init}) => ({dispatch, getState}) => next => {
  // TODO remove global assignment:

  const withDoc = (type, doc) =>
    ({
      type,
      id: doc._actorId,
      doc,
      isReady: sync.isOpened(doc._actorId),
      isWritable: sync.isWritable(doc._actorId)
    })

  sync.once('ready', () => {
    const archiverKey = sync.core.archiver.changes.key.toString('hex')

    dispatch({type: 'HYPERMERGE_READY', archiverKey})

    sync.openAll()
    if (!sync.any()) dispatch({type: 'CREATE_DOCUMENT'})
  })
  .on('document:ready', doc => dispatch(withDoc('DOCUMENT_READY', doc)))
  .on('document:updated', doc => dispatch(withDoc('DOCUMENT_UPDATED', doc)))

  return action => {
    switch (action.type) {
      case 'CREATE_DOCUMENT':
        return next(withDoc('DOCUMENT_CREATED', sync.update(init(sync.create()))))

      case 'OPEN_DOCUMENT':
        return next(withDoc('DOCUMENT_OPENED', sync.open(action.id)))

      case 'UPDATE_DOCUMENT':
        sync.update(action.doc)
        return next(action)

      case 'DELETE_DOCUMENT':
        return next(withDoc('DOCUMENT_DELETED', sync.delete(action.id)))

      case 'FORK_DOCUMENT': {
        const doc = sync.fork(action.id)
        sync.share(doc._actorId, action.id)
        return next(withDoc('DOCUMENT_FORKED', doc))
      }

      case 'MERGE_DOCUMENT':
        return next(withDoc('DOCUMENT_MERGED', sync.merge(action.dst, action.src)))
    }

    // HACK TODO figure out a better way to do this:
    const prevProjects = getState().projects
    const res = next(action)
    const {projects} = getState()

    projects.forEach((pro, k) => {
      if (!pro || !pro.doc) return
      if (!sync.isWritable(pro.doc._actorId)) return
      if (!prevProjects.get(k)) return
      if (is(pro.doc, prevProjects.get(k).doc)) return

      sync.update(pro.doc)
    })
    // END HACK

    return res
  }
}
