import EventEmitter from 'events'
import hypermerge from 'hypermerge/hypermerge'
import swarm from 'hyperdiscovery'
import shortid from 'shortid'

export default class HyperSync extends EventEmitter {
  constructor({name, path, maxLocalClients, startingPort}) {
    super()

    this.path = path
    this.merges = {}
    this._loadIndex()
    this._readIndex()
    // TODO add pending merge queue
    this.name = name || "unnamed user"
    this.currentPort = startingPort || 3282
    this.maxLocalClients = maxLocalClients || 5
  }

  createDocument() {
    const path = this._newPath()

    const merge = hypermerge(path, {
      name: this.name,
    })

    merge.on('ready', () => {
      const key = merge.key.toString('hex')

      this._setIndex(key, path)

      this.merges[key] = merge
      this._onMergeReady(merge)
      this.emit('document:created', merge.doc.get())
    })
  }

  openDocument(key) {
    const path = this._indexedPath(key)

    const merge = this.merges[key] = hypermerge(path, {
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
    const path = this._indexedPath(key)

    const merge = this.merges[key] = hypermerge(path, {
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

  _getIndex(key) {
    return this.index[key]
  }

  _setIndex(key, path) {
    this.index[key] = path
    this._saveIndex()
    return path
  }

  _deleteIndex(key) {
    delete this.index[key]
    this._saveIndex()
  }

  _indexedPath(key) {
    return this._getIndex(key) || this._setIndex(key, this._newPath())
  }

  _readIndex() {
    for (const key in this.index) {
      this.openDocument(key)
    }
  }

  _saveIndex() {
    localStorage.setItem(this.path, JSON.stringify(this.index))
  }

  _loadIndex() {
    const data = localStorage.getItem(this.path)
    this.index = data ? JSON.parse(data) : {}
  }

  _newPath() {
    const id = shortid.generate()
    return `${this.path}/docs/${id}`
  }

  _newPort() {
    const port = this.currentPort
    this.currentPort += this.maxLocalClients
    return port
  }
}
