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
    sync.updateDocument(project)
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

  sync.on('document:opened', project => {
    dispatch({type: "REMOTE_PROJECT_OPENED", project})
  })

  sync.on('document:updated', project => {
    // TODO this fires for my changes too
    dispatch({type: "REMOTE_PROJECT_UPDATED", project})
  })

  sync.on('feed:listening', feed => {
    const key = feed.key.toString('hex')
    const id = feed.source.id.toString('hex')
    const writable = feed.source.writable

    dispatch({type: 'SELF_CONNECTED', key, id, writable})
  })

  sync.on('feed:joined', (feed, {id, info}) => {
    const key = feed.key.toString('hex')
    dispatch({type: 'PEER_CONNECTED', key, id, info})
  })

  sync.on('feed:left', (feed, {id}) => {
    const key = feed.key.toString('hex')
    dispatch({type: 'PEER_DISCONNECTED', key, id})
  })
}

class HyperSync extends EventEmitter {
  constructor({name, maxLocalClients, startingPort}) {
    super()

    this.feeds = {}
    // TODO add pending feed queue
    this.name = name || "unnamed user"
    this.currentPort = startingPort || 3282
    this.maxLocalClients = maxLocalClients || 5
  }

  createDocument() {
    const feed = hypermerge({
      name: this.name,
    })

    feed.on('ready', () => {
      const key = feed.key.toString('hex')

      this.feeds[key] = feed
      this._onFeedReady(feed)
      this.emit('document:created', feed.doc.get())
    })
  }

  openDocument(key) {
    const feed = this.feeds[key] = hypermerge({
      name: this.name,
      key,
    })

    feed.on('ready', () => {
      this._onFeedReady(feed)
      this.emit('document:opened', feed.doc.get())
    })
  }

  addDocument(doc) {
    const key = doc._actorId

    const feed = this.feeds[key] = hypermerge({
      name: this.name,
      key,
    })

    feed.on('ready', () => {
      this._onFeedReady(feed)
    })
  }

  updateDocument(doc) {
    const key = doc._actorId

    if (this.feeds[key]) {
      this.feeds[key].doc.set(doc)
    } else {
      this.addDocument(doc)
    }
  }

  _onFeedReady = feed => {
    feed.doc.registerHandler(doc => {
      this.emit('document:updated', doc)
    })

    const userData = {
      name: this.name
    }

    if (feed.local) {
      userData.key = feed.local.key.toString('hex')
    }

    const sw = swarm(feed, {
      port: this._newPort(),
      stream: _peer =>
        feed.replicate({
          live: true,
          upload: true,
          download: true,
          userData: JSON.stringify(userData),
        }),
    })

    sw.on('listening', () => {
      this.emit('feed:listening', feed)
    })

    sw.on('connection', (peer, type) => {
      try {
        const info = JSON.parse(peer.remoteUserData.toString())
        const id = peer.remoteId.toString('hex')

        if (info.key) {
          feed.connectPeer(info.key)
        }

        this.emit('feed:joined', feed, {id, info})

        peer.on('close', () => {
          this.emit('feed:left', feed, {id, info})
        })

      } catch (e) {
        // TODO emit error
        console.error('Error parsing userData JSON', e)
      }
    })
  }

  _newPort() {
    const port = this.currentPort
    this.currentPort += this.maxLocalClients
    return port
  }
}
