import Automerge from 'automerge'
import { EventEmitter } from 'events'
import HyperMerge from 'hypermerge/HyperMerge'

export default class HyperSync extends EventEmitter {
  constructor ({...rest}) {
    super()

    this.groups = {} // groupId -> merged doc

    this.hypermerge = new HyperMerge(rest)
    this._start()
  }

  openAll () {
    this.hypermerge.openAll()
  }

  create (metadata = {}) {
    const feed = this.hypermerge.feed()

    const hex = feed.key.toString('hex')

    this.hypermerge._appendMetadata(hex, {groupId: hex, parentId: null, ...metadata})

    const doc = this.hypermerge.set(this.hypermerge.empty(hex))
    this.groups[hex] = doc

    return doc
  }

  open (hex) {
    return this.hypermerge.open(hex)
  }

  fork (hex, metadata = null) {

  }

  update (doc) {
    const hex = this.hypermerge.getHex(doc)
    const {groupId} = this.hypermerge.metadata(hex)

    this.groups[groupId] = doc
    this.hypermerge.update(doc)

    return doc
  }

  joinSwarm (opts) {
    this.hypermerge.joinSwarm(opts)
  }

  _processDoc (doc) {
    const hex = this.hypermerge.getHex(doc)
    const {groupId} = this.hypermerge.metadata(hex)
    const isWritable = this.hypermerge.isWritable(hex)

    if (this.groups[groupId]) {
      this.groups[groupId] = Automerge.merge(this.groups[groupId], doc)
    } else if (isWritable) {
      this.groups[groupId] = doc
    } else {
      // TODO queue up the doc somehow until we have a writable relative
    }

    return this.groups[groupId]
  }

  _onDocumentReady () {
    return docPart => {
      console.log('document:ready', docPart)
      const doc = this._processDoc(docPart)
      this.emit('document:ready', doc)
    }
  }

  _onDocumentUpdated () {
    return docPart => {
      const doc = this._processDoc(docPart)
      this.emit('document:updated', doc)
    }
  }

  _onReady () {
    return () => {
      this.emit('ready', this)
    }
  }

  _start () {
    this.hypermerge
    .on('ready', this._onReady())
    .on('document:ready', this._onDocumentReady())
    .on('document:updated', this._onDocumentUpdated())
  }
}
