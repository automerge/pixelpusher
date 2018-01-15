import EventEmitter from 'events'
import Automerge from 'automerge'
import hypermerge from 'hypermerge'
import swarm from 'hyperdiscovery'
import whenChanged from './whenChanged'
import { deserializeProject } from '../utils/serialization';
import {getProject} from '../store/reducers/reducerHelpers'
import Project from '../records/Project'
import * as Init from '../logic/Init'

export default store => {
  const {dispatch} = store

  const clientId = +(process.env.CLIENT_ID || 0)

  const sync = global.sync = new HyperSync({
    name: `client id ${clientId}`,
    startingPort: 3282 + clientId,
  })

  whenChanged(store, state => state.createdProjectCount, shouldCreate => {
    if (shouldCreate) sync.createDocument()
  })

  whenChanged(store, getProject, project => {
    // NOTE whenChanged uses Immutable.is. This might not capture all changes
    sync.updateDocument(project.get('id'), project)
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
  // sync.on('document:opened', project => {
  //   dispatch({type: "REMOTE_PROJECT_OPENED", project})
  // })

  sync.on('document:updated', project => {
    // TODO this fires for my changes too
    dispatch({type: "REMOTE_PROJECT_UPDATED", project})
  })

  sync.on('merge:listening', merge => {
    const key = merge.key.toString('hex')
    const id = merge.source.id.toString('hex')
    const writable = merge.source.writable

    dispatch({type: 'SELF_CONNECTED', key, id, writable})
  })

  sync.on('merge:joined', (merge, {id, info}) => {
    const key = merge.key.toString('hex')
    dispatch({type: 'PEER_CONNECTED', key, id, info})
  })

  sync.on('merge:left', (merge, {id}) => {
    const key = merge.key.toString('hex')
    dispatch({type: 'PEER_DISCONNECTED', key, id})
  })
}

class HyperSync extends EventEmitter {
  constructor({name, maxLocalClients, startingPort}) {
    super()

    this.merges = {}
    // TODO add pending merge queue
    this.name = name || "unnamed user"
    this.currentPort = startingPort || 3282
    this.maxLocalClients = maxLocalClients || 5
  }

  createDocument() {
    const merge = hypermerge({
      name: this.name,
    })

    merge.on('ready', () => {
      const key = merge.key.toString('hex')

      this.merges[key] = merge
      this._onMergeReady(merge)
      this.emit('document:created', merge.doc.get())
    })
  }

  openDocument(key) {
    const merge = this.merges[key] = hypermerge({
      name: this.name,
      key,
    })

    merge.on('ready', () => {
      this._onMergeReady(merge)

      this.emit('document:opened', merge.doc.get())
    })
  }

  addDocument(doc) {
    const key = doc._actorId

    const merge = this.merges[key] = hypermerge({
      name: this.name,
      key,
    })

    merge.on('ready', () => {
      this._onMergeReady(merge)
    })
  }

  updateDocument(key, doc) {
    if (this.merges[key]) {
      this.merges[key].doc.set(doc)
    } else {
      this.addDocument(doc)
    }
  }

  _onMergeReady = merge => {
    merge.doc.registerHandler(doc => {
      this.emit('document:updated', doc)
    })

    const userData = {
      name: this.name
    }

    if (merge.local) {
      userData.key = merge.local.key.toString('hex')
    }

    const sw = swarm(merge, {
      port: this._newPort(),
      stream: _peer =>
        merge.replicate({
          live: true,
          upload: true,
          download: true,
          userData: JSON.stringify(userData),
        }),
    })

    sw.on('listening', () => {
      this.emit('merge:listening', merge)
    })

    sw.on('connection', (peer, type) => {
      const info = JSON.parse(peer.remoteUserData.toString())
      const id = peer.remoteId.toString('hex')

      if (info.key) {
        merge.connectPeer(info.key)
      }

      this.emit('merge:joined', merge, {id, info})

      peer.on('close', () => {
        this.emit('merge:left', merge, {id, info})
      })
    })
  }

  _newPort() {
    const port = this.currentPort
    this.currentPort += this.maxLocalClients
    return port
  }
}
