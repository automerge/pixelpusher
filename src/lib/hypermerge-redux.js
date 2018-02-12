import {equals} from '../logic/Versions'
import { is } from 'immutable'

export default (sync, {init, map}) => ({dispatch, getState}) => next => {
  if (!map) map = x => x

  const withDoc = (type, doc) =>
    map({
      type,
      id: doc._actorId,
      doc,
      metadata: sync.metadata(doc._actorId),
      isReady: sync.isOpened(doc._actorId),
      isWritable: sync.isWritable(doc._actorId)
    }, getState())

  const withPeer = (type, docId, peer) => {
    return map({
      type,
      id: peer.remoteId.toString('hex'),
      docId,
      isOnline: !peer._closed,
      canWrite: sync.isWritable(docId)
    }, getState())
  }

  sync.once('ready', () => {
    const archiverKey = sync.core.archiver.changes.key.toString('hex')

    dispatch({type: 'HYPERMERGE_READY', archiverKey})

    sync.openAll()
  })
  .on('document:ready', doc => dispatch(withDoc('DOCUMENT_READY', doc)))
  .on('document:updated', doc => dispatch(withDoc('DOCUMENT_UPDATED', doc)))
  .on('peer:joined', (hex, peer) => {
    if (!peer.remoteId) return
    dispatch(withPeer('PEER_JOINED', hex, peer))
  })
  .on('peer:left', (hex, peer) => {
    if (!peer.remoteId) return
    dispatch(withPeer('PEER_LEFT', hex, peer))
  })
  .on('document:metadata', (id, metadata) => {
    dispatch(map({
      type: 'DOCUMENT_METADATA',
      id,
      metadata,
      isWritable: sync.isWritable(id)
    }, getState()))
  })

  return _action => {
    const action = map(_action, getState())
    switch (action.type) {
      case 'CREATE_DOCUMENT':
        return next(withDoc('DOCUMENT_CREATED',
          sync.update(init(action.metadata)(sync.create(action.metadata)))))

      case 'OPEN_DOCUMENT':
        return next(withDoc('DOCUMENT_OPENED', sync.open(action.id)))

      case 'UPDATE_DOCUMENT':
        sync.update(action.doc)
        return next(action)

      case 'DELETE_DOCUMENT':
        return next({type: 'DOCUMENT_DELETED', id: action.id})

      case 'FORK_DOCUMENT': {
        const doc = sync.fork(action.id, action.metadata)
        sync.share(doc._actorId, action.id)
        return next(withDoc('DOCUMENT_FORKED', doc))
      }

      case 'MERGE_DOCUMENT':
        return next(withDoc('DOCUMENT_MERGED', sync.merge(action.dst, action.src)))
    }

    // HACK TODO figure out a better way to do this:
    const prev = getState()
    const res = next(action)
    const curr = getState()

    watch(sync, ['projects'], prev, curr)
    watch(sync, ['identities'], prev, curr)
    // END HACK

    return res
  }
}

// HACK pixelpusher specific:
const watch = (sync, path, prevState, currState) => {
  const prev = prevState.getIn(path)
  const curr = currState.getIn(path)

  if (is(curr, prev)) return

  curr.forEach((rec, k) => {
    const pRec = prev.get(k)

    if (!rec || !rec.doc) return
    if (!rec.isWritable) return
    if (!pRec || !pRec.doc) return
    if (equals(rec, pRec)) return

    sync.update(rec.doc)
  })
}
