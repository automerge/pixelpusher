import whenChanged from './whenChanged'
import {getProject} from '../store/reducers/reducerHelpers'
import * as Init from '../logic/Init'
import Project from '../records/Project'
import HyperMerge from 'hypermerge/HyperMerge'

export default store => {
  const {dispatch} = store

  const clientId = +(process.env.CLIENT_ID || 0)

  document.title = `pixelpusher client ${clientId}`

  whenChanged(store, state => state.isLoaded, isLoaded => {
    if (isLoaded) initSync()
  })

  function initSync () {
    global.sync = new HyperMerge({
      peerInfo: store.getState().present.peerInfo.toJS(),
      port: 3282 + clientId,
      path: `./.data/pixelpusher-v7/client-${clientId}`
    }).once('ready', _syncReady)
  }

  function _syncReady (sync) {
    console.log('Archiver changes feed:',
                sync.core.archiver.changes.key.toString('hex'))
    sync.openAll()

    if (!sync.any()) {
      dispatch({type: 'NEW_PROJECT_CLICKED'})
    }

    whenChanged(store, state => state.peerInfo, info => {
      sync.peerInfo = info.toJS()
    })

    whenChanged(store, state => state.createdProjectCount, shouldCreate => {
      if (!shouldCreate) return

      const project = sync.update(Init.project(sync.create()))

      dispatch({type: 'PROJECT_CREATED', project})
    })

    whenChanged(store, state => state.projects, projects => {
      projects.forEach(project => {
        const {id, doc} = project

        if (project.isOpening) {
          sync.open(doc)
        } else if (project.isDeleting) {
          sync.delete(id)
          dispatch({type: 'PROJECT_DELETED', id})
        } else if (project.isForking) {
          const sourceId = project.id
          project = makeProject(sync.fork(id))
          dispatch({type: 'PROJECT_FORKED', project, sourceId})
        } else if (project.isWritable) {
          sync.update(doc)
        }
      })
    })

    whenChanged(store, state => state.mergingProjectId, id => {
      if (!id) return

      const currentId = store.getState().present.currentProjectId

      const project = makeProject(sync.merge(currentId, id))
      dispatch({type: 'PROJECT_MERGED', project})
    })

    sync.on('document:ready', doc => {
      if (!doc.get('relativeId')) return
      const project = makeProject(doc)
      dispatch({type: 'REMOTE_PROJECT_OPENED', project})
    })

    sync.on('document:updated', doc => {
      if (!doc.get('relativeId')) return
      const project = makeProject(doc)
      dispatch({type: 'REMOTE_PROJECT_UPDATED', project})
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
      if (avatarKey) sync.openDocument(avatarKey)
    })

    sync.on('merge:left', (merge, {id}) => {
      const key = merge.key.toString('hex')
      dispatch({type: 'PEER_DISCONNECTED', key, id})
    })

    const makeProject = doc =>
      Project({
        id: doc._actorId,
        doc,
        isWritable: sync.isWritable(doc._actorId)
      })
  }
}
