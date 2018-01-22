import EventEmitter from 'events'
import hypermergeMicro from 'hypermerge/hypermerge-micro-immutable'
import swarm from 'hyperdiscovery'
import shortid from 'shortid'

export default class HyperSync extends EventEmitter {
  constructor({peerInfo, path, port}) {
    super()

    this.path = path
    this.port = port || 0
    this.merges = {}
    this._loadIndex()
    this._readIndex()
    this.peerInfo = peerInfo || {name: "Unknown"}

    if (peerInfo.identity) {
      this.identityMerge = this.openDocument(peerInfo.identity)
    } else {
      this.identityMerge = this.createDocument()
      this.emit('identity:created', this.identityMerge.key.toString("hex"))
    }
  }

  setPeerInfo(pi) {
    this.peerInfo = pi.toJS()
    if (this.identityMerge) {
      // FIXME - why does this get called when identity merge is null sometimes
      var doc = this.identityMerge.doc.get()
      doc.name = pi.name
      doc.avatarKey = pi.avatarKey
    }
  }

  createDocument() {
    return this._createMerge(null, merge => {
      this.emit('document:created', merge.doc.get())
    })
  }

  openDocument(key, cb) {
    return this._createMerge(key, merge => {
      this.emit('document:opened', merge.doc.get(), merge)
    }, cb)
  }

  updateDocument(key, doc) {
    if (this.merges[key]) {
      this.merges[key].doc.set(doc)
    } else {
      throw new Error(`Merge has not been opened: ${key}`)
    }
  }

  deleteDocument(key) {
    // TODO delete the hypermerge directory
    this._deleteIndex(key)
  }

  _createMerge(key, cb) {
    // FIXME not sure why the callback is not called when the key exists - I didnt want to change this behavior so I added a second callback
    if (key && this.merges[key]) return


    const path = key
      ? this._indexedPath(key)
      : this._newPath()

    const merge = hypermergeMicro(path, {key})

    if (key) this.merges[key] = merge

    merge.path = path

    return merge.once('ready', () => {
      this._onMergeReady(merge)
      cb(merge)
    })
  }

  _onMergeReady = merge => {
    const key = merge.key.toString('hex')

    this._setIndex(key, merge.path)
    this.merges[key] = merge

    merge.doc.registerHandler(doc => {
      this.emit('document:updated', doc, merge)
    })

    const userData = {
      peerInfo: this.peerInfo
    }

    if (merge.local) {
      userData.key = merge.local.key.toString('hex')
    }

    userData.id = (merge.local || merge.source).key.toString('hex')

    const sw = swarm(merge, {
      port: this.port,
      stream: _peer =>
        merge.replicate({
          live: true,
          upload: true,
          download: true,
          userData: JSON.stringify(userData),
        }),
    })

    sw.once('listening', () => {
      this.emit('merge:listening', merge)
    })

    sw.on('connection', (peer, type) => {
      const info = JSON.parse(peer.remoteUserData.toString())
      // const id = peer.remoteId.toString('hex')
      const id = info.id

      if (info.key) {
        merge.connectPeer(info.key)
      }

      this.emit('merge:joined', merge, {id, info})

      console.log("MERGE JOINED",info.peerInfo)

      peer.once('close', () => {
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
}
