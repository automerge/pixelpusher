import {equals} from '../logic/Versions'
import { is } from 'immutable'
import { assign } from 'lodash'

export default (sync, {init, map}) => ({dispatch, getState}) => next => {
  if (!map) map = x => x

  const withDoc = (type, doc) => {
    const id = sync.getId(doc)
    const actor = sync.getHex(doc)

    // For now, merge the metadata and infos together
    const metadata = sync.metadata(actor)
    const metadatas = sync.metadatas(id)

    return map({
      type,
      id,
      doc,
      metadata,
      metadatas
    }, getState())
  }

  const withPeer = (type, docId, peer) => {
    return map({
      type,
      id: peer.remoteId.toString('hex'),
      docId,
      isOnline: peer._index > -1
    }, getState())
  }

  sync.once('ready', () => {
    const archiverKey = sync.core.archiver.changes.key.toString('hex')

    dispatch({type: 'HYPERMERGE_READY', archiverKey})
  })
  .on('document:ready', (id, doc) => dispatch(withDoc('DOCUMENT_READY', doc)))
  .on('document:updated', (id, doc) => dispatch(withDoc('DOCUMENT_UPDATED', doc)))
  .on('peer:joined', (docId, peer) => {
    if (!peer.remoteId) return
    dispatch(withPeer('PEER_JOINED', docId, peer))
  })
  .on('peer:left', (docId, peer) => {
    if (!peer.remoteId) return
    dispatch(withPeer('PEER_LEFT', docId, peer))
  })

  return _action => {
    const action = map(_action, getState())
    switch (action.type) {
      case 'CREATE_DOCUMENT':
        return next(withDoc('DOCUMENT_CREATED',
          sync.update(init(action.metadata)(sync.create(action.metadata)))))

      case 'OPEN_DOCUMENT':
        sync.open(action.id)
        return next(map(Object.assign({}, action, {type: 'DOCUMENT_OPENING'})))

      case 'UPDATE_DOCUMENT':
        sync.update(action.doc)
        return next(action)

      case 'DELETE_DOCUMENT':
        return next({type: 'DOCUMENT_DELETED', id: action.id})

      case 'FORK_DOCUMENT': {
        const doc = sync.fork(action.id)
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
    if (!pRec || !pRec.doc) return
    if (equals(rec, pRec)) return
    if (rec.doc === sync.find(sync.getId(rec.doc))) return

    sync.update(rec.doc)
  })
}
