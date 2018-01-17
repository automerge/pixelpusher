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

  function initSync() {
    const sync = global.sync = new HyperSync({
      peerInfo: store.getState().present.peerInfo.toJS(),
      startingPort: 3282 + clientId,
      path: `./.data/pixelpusher-v5/client-${clientId}`,
    })

    if (Object.keys(sync.index).length === 0) {
      dispatch({type: 'NEW_PROJECT_CLICKED'})
    }

    whenChanged(store, state => state.peerInfo, info => {
      sync.peerInfo = info.toJS()
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

    sync.on('document:created', project => {
      project = Init.project(project)

      dispatch({type: "PROJECT_CREATED", project})
    })

    // TODO this fires before the project has an id:
    sync.on('document:opened', project => {
      if (!project.get('id')) return
      dispatch({type: "REMOTE_PROJECT_OPENED", project})
    })

    // TODO this fires before the project has an id:
    sync.on('document:added', project => {
      if (!project.get('id')) return
      dispatch({type: "REMOTE_PROJECT_ADDED", project})
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

      const {avatarKey} = info.peerInfo || {}
      if (avatarKey) sync.addDocument(avatarKey)
    })

    sync.on('merge:left', (merge, {id}) => {
      const key = merge.key.toString('hex')
      dispatch({type: 'PEER_DISCONNECTED', key, id})
    })
  }
}
