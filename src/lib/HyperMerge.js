const EventEmitter = require('events')
const Automerge = require('automerge')
const MultiCore = require('hypermerge/multicore')

module.exports = class HyperMerge extends EventEmitter {
  constructor({path, onFork}) {
    super()

    this.feeds = {}
    this.docs = {}
    // TODO allow ram:
    this.core = new MultiCore(path)

    // Allows setting a new id, etc when a document is forked:
    this.onFork = onFork || (() => {})

    this.core.ready(this._ready)
  }

  any(f = () => true) {
    return Object.values(this.docs).some(f)
  }

  find(hex) {
    if (!this.docs[hex]) throw new Error(`Cannot find document. open(hex) first. Key: ${hex}`)
    return this.docs[hex]
  }

  set(doc) {
    const hex = this.getHex(doc)
    return this.docs[hex] = doc
  }

  open(hex) {
    return this.document(hex)
  }

  openAll() {
    Object.values(this.core.archiver.feeds).forEach(feed => {
      this.open(feed.key.toString('hex'))
    })
  }

  // Local mutations:

  create() {
    return this.document()
  }

  update(doc) {
    const hex = this.getHex(doc)

    if (!this.isOpened(hex)) {
      this.feed(hex).once('ready', () => this.update(doc))
      return doc
    }

    if (!this.isWritable(hex)) {
      throw new Error(`Document not writable. fork() first. Key: ${hex}`)
    }

    const pDoc = this.find(hex)
    const changes = Automerge.getChanges(pDoc, doc)

    this._appendAll(hex, changes)

    return this.set(doc)
  }

  fork(hex) {
    let doc = this.find(hex)
    doc = Automerge.merge(this.create(), doc)
    doc = Automerge.change(doc, `Forked from ${hex}`, this.onFork)
    this.update(doc)
    return doc
  }

  merge(hex, hex2) {
    const doc = Automerge.merge(this.find(hex), this.find(hex2))
    return this.update(doc)
  }

  delete(hex) {
    const doc = this.find(hex)
    this.core.archiver.remove(hex)
    delete this.feeds[hex]
    delete this.docs[hex]
    return doc
  }

  isWritable(hex) {
    return this.feed(hex).writable
  }

  isOpened(hex) {
    return this.feed(hex).opened
  }

  document(hex = null) {
    if (hex && this.docs[hex]) return this.docs[hex]

    const feed = this.feed(hex)
    hex = feed.key.toString('hex')

    return this.set(this.empty(hex))
  }

  empty(hex) {
    return Automerge.initImmutable(hex)
  }

  getHex(doc) {
    return doc._actorId
  }

  feed(hex = null) {
    if (hex && this.feeds[hex]) return this.feeds[hex]

    const key = hex ? Buffer(hex, 'hex') : null

    return this._trackFeed(this.core.createFeed(key))
  }

  _appendAll(hex, changes) {
    return Promise.all(changes.map(change =>
      this._append(hex, change)))
  }

  _append(hex, change) {
    return this._promise(cb => {
      const data = JSON.stringify(change)
      this.feed(hex).append(data, cb)
    })
  }

  _trackFeed = feed => {
    const hex = feed.key.toString('hex')
    this.feeds[hex] = feed

    feed.on('download', this._onDownload(hex))

    this._getAllBlocks(hex)
    .then(blocks => this._applyBlocks(hex, blocks))
    .then(() => {
      this._debug('document:ready', hex)
      this.emit('document:ready', this.find(hex))
    })

    return feed
  }

  _getAllBlocks(hex) {
    return this._getOwnBlocks(hex)
    .then(blocks =>
      // TODO not efficient:
      this._getDependentBlocks(hex)
      .then(depBlocks =>
        blocks.concat(depBlocks)))
  }

  _getOwnBlocks(hex, last = null) {
    const feed = this.feed(hex)
    last = last || (feed.length - 1)

    return Promise.all(Array(last + 1).fill().map((_, i) =>
      this._getBlock(hex, i)))
  }

  _getBlock(hex, index) {
    return this._promise(cb => {
      this.feed(hex).get(index, cb)
    })
  }

  _getDependentBlocks(hex) {
    const deps = Automerge.getMissingDeps(this.document(hex))

    return Promise.all(Object.keys(deps).map(hx =>
      this._getOwnBlocks(hx, deps[hx])))
  }

  _onDownload = hex => (index, data) => {
    this._applyBlocks(hex, [data])
  }

  _applyBlocks(hex, blocks) {
    return this._applyChanges(hex, blocks.map(data => JSON.parse(data)))
  }

  _applyChanges(hex, changes) {
    return this.set(Automerge.applyChanges(this.document(hex), changes))
  }

  _ready = () => {
    this.emit('ready', this)
  }

  _promise = f => {
    return new Promise((res, rej) => {
      f((err, x) => {
        err ? rej(err) : res(x)
      })
    })
  }

  _debug = (...args)  => {
    console.log('[HyperMerge]', ...args)
  }
}
