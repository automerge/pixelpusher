import EventEmitter from 'events'
import hypermergeMicro from 'hypermerge/hypermerge-micro-immutable'
import swarm from 'hyperdiscovery'
import shortid from 'shortid'

export default class HyperSync extends EventEmitter {
  constructor({peerInfo, path}) {
    super()

    this.path = path
    this.merges = {}
    this._loadIndex()
    this._readIndex()
    this.peerInfo = peerInfo || {name: "Unknown"}
  }

  createDocument() {
    const path = this._newPath()

    const merge = hypermergeMicro(path)

    merge.on('ready', () => {
      const key = merge.key.toString('hex')

      this._setIndex(key, path)

      this.merges[key] = merge
      this._onMergeReady(merge)
      this.emit('document:created', merge.doc.get())
    })
  }

  openDocument(key) {
    if (this.merges[key]) return

    const path = this._indexedPath(key)

    const merge = this.merges[key] = hypermergeMicro(path, {key})

    merge.on('ready', () => {
      this._onMergeReady(merge)

      this.emit('document:opened', merge.doc.get(), merge)
    })
  }

  addDocument(key) {
    if (this.merges[key]) return

    const path = this._indexedPath(key)

    const merge = this.merges[key] = hypermergeMicro(path, {key})

    merge.on('ready', () => {
      this._onMergeReady(merge)

      this.emit('document:added', merge.doc.get(), merge)
    })
  }


  updateDocument(key, doc) {
    if (this.merges[key]) {
      this.merges[key].doc.set(doc)
    }
  }

  deleteDocument(key) {
    // TODO delete the hypermerge directory
    this._deleteIndex(key)
  }

  _onMergeReady = merge => {
    merge.doc.registerHandler(doc => {
      this.emit('document:updated', doc, merge)
    })

    const userData = {
      peerInfo: this.peerInfo
    }

    if (merge.local) {
      userData.key = merge.local.key.toString('hex')
    }

    const sw = swarm(merge, {
      port: 0,
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
      this.addDocument(key)
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
}
