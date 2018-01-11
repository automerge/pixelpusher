import EventEmitter from 'events'
import hypermerge from 'hypermerge'
import swarm from 'hyperdiscovery'
import whenChanged from './whenChanged'
import { deserializeProject } from '../utils/serialization';
import {getProject} from '../store/reducers/reducerHelpers'
import Project from '../records/Project'

export default store => {
  const {dispatch} = store


  const clientId = +(process.env.CLIENT_ID || 0)

  const sync = new HyperSync({
    name: `client id ${clientId}`,
    startingPort: 3282 + clientId,
  })

  whenChanged(store, state => state.creatingProject, shouldCreate => {
    if (shouldCreate) sync.createDocument()
  })

  whenChanged(store, ['currentProject'], project => {
    sync.updateDocument(project)
  })

  whenChanged(store, state => state.creatingProject, shouldCreate => {
    if (!shouldCreate) return

    const keys = keyPair()

    const project = Project({
      id: keys.publicKey.toString('hex'),
    })

    addFeedForProject(feeds, dispatch, project, keys.secretKey)

    dispatch({type: "PROJECT_CREATED", project})
  })

  whenChanged(store, state => state.clonedProjectId, id => {
    if (!id) return

    const originalProject = store.getState().present.projects.get(id)

    const keys = keyPair()

    const project = originalProject.merge({
      id: keys.publicKey.toString('hex'),
    })

    addFeedForProject(feeds, dispatch, project, keys.secretKey)

    dispatch({type: "PROJECT_CLONED", project})
  })

  sync.on('document:created', project => {
    // TODO assign project _actorId to project.id
    dispatch({type: "PROJECT_CREATED", project})
  })

  sync.on('document:updated', project => {
    dispatch({type: "REMOTE_PROJECT_UPDATED", project})
  })

  sync.on('feed:listening', feed => {
    const key = feed.key.toString('hex')
    const id = feed.id.toString('hex')
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

      feeds[key] = feed
      this._onFeedReady(feed)
      feed.emit('document:created', this.doc.get())
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
          userData,
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
    currentPort += this.maxLocalClients
    return port
  }
}
