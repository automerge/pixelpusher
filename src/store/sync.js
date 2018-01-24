import whenChanged from './whenChanged'
import { deserializeProject } from '../utils/serialization';
import {getProject} from '../store/reducers/reducerHelpers'
import Project from '../records/Project'
import * as Init from '../logic/Init'
import HyperSync from '../lib/HyperSync';

export default store => {
  const {dispatch} = store

  const clientId = +(process.env.CLIENT_ID || 0)

  document.title = `pixelpusher client ${clientId}`

  whenChanged(store, state => state.isLoaded, isLoaded => {
    if (isLoaded) initSync()
  })

  function identityPump(key, id) {
    id.once('ready', () => {
      dispatch({type: 'IDENTITY_UPDATE', key, identity: id.doc.get().toJS() })
      id.doc.registerHandler(doc => {
        dispatch({type: 'IDENTITY_UPDATE', key, identity: id.doc.get().toJS() })
      })
    })
  }

  function initSync() {
    const sync = global.sync = new HyperSync({
      peerInfo: store.getState().present.peerInfo.toJS(),
      port: 3282 + clientId,
      path: `./.data/pixelpusher-v6/client-${clientId}`,
    })

    sync.setupIdentity(identityPump)

    if (Object.keys(sync.index).length === 0) {
      dispatch({type: 'NEW_PROJECT_CLICKED'})
    }


    whenChanged(store, state => state.peerInfo, info => {
      console.log("PEER INFO CHANGED")
      sync.setPeerInfo(info)
    })

    whenChanged(store, state => state.createdProjectCount, shouldCreate => {
      if (shouldCreate) sync.createDocument()
    })

    whenChanged(store, getProject, project => {
      // NOTE whenChanged uses Immutable.is. This might not capture all changes
      sync.updateDocument(project.get('id'), project)
    })

    whenChanged(store, state => state.projects.keySeq(), (ids, pIds) => {
      if (!pIds) return

      pIds.forEach(id => {
        if (!ids.includes(id)) sync.deleteDocument(id)
      })
    })

    whenChanged(store, state => state.clonedProjectId, id => {
      if (!id) return

      // TODO make this real:
      sync.cloneDocumentFromId(id)
    })

    whenChanged(store, state => state.openingProjectId, id => {
      if (!id) return
      sync.openDocument(id)
    })

    sync.on('identity:created', identity => {
      console.log("sync: id created", identity)
      let key = identity.key.toString("hex")
      identityPump(key, identity)
      dispatch({type: "IDENTITY_CREATED", key})
    })

    sync.on('document:created', project => {
      project = Init.project(project)

      dispatch({type: "PROJECT_CREATED", project})
    })

    sync.on('document:opened', project => {
      if (!project.get('id')) return
      dispatch({type: "REMOTE_PROJECT_OPENED", project})
    })

    sync.on('document:updated', project => {
      // TODO this fires for my changes too
      dispatch({type: "REMOTE_PROJECT_UPDATED", project})
    })

    sync.on('merge:listening', merge => {
      const key = merge.key.toString('hex')
      const id = (merge.local || merge.source).id.toString('hex')

      dispatch({type: 'SELF_CONNECTED', key, id})
    })

    sync.on('merge:joined', (merge, {id, info}) => {
      const key = merge.key.toString('hex')
      dispatch({type: 'PEER_CONNECTED', key, id, info})

      const {avatarKey,identity} = info.peerInfo || {}
      if (avatarKey) sync.openDocument(avatarKey)
      if (identity) identityPump(identity, sync.openDocument(identity))
    })

    sync.on('merge:left', (merge, {id}) => {
      const key = merge.key.toString('hex')
      dispatch({type: 'PEER_DISCONNECTED', key, id})
    })
  }
}
