import Automerge from 'automerge'
import { EventEmitter } from 'events'
import HyperMerge from 'hypermerge/HyperMerge'

export default class HyperSync extends EventEmitter {
  constructor ({...rest}) {
    super()

    this.groups = {} // groupId -> merged doc
    this.pending = {} // groupId -> merged doc (read-only)

    this.hypermerge = new HyperMerge(rest)
    this._start()
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

  metadata (hex) {
    return this.hypermerge.metadata(hex)
  }

  joinSwarm (opts) {
    this.hypermerge.joinSwarm(opts)
  }

  _processDocPart (docPart) {
    const hex = this.hypermerge.getHex(docPart)
    const {groupId} = this.hypermerge.metadata(hex)
    const isWritable = this.hypermerge.isWritable(hex)

    if (this.groups[groupId]) {
      this.groups[groupId] = Automerge.merge(this.groups[groupId], docPart)
    } else if (isWritable) {
      this.groups[groupId] = docPart
    } else if (this.pending[groupId]) {
      this.pending[groupId] = Automerge.merge(this.pending[groupId], docPart)
    } else {
      this.pending[groupId] = docPart
    }

    return this.groups[groupId]
  }

  _onDocumentReady () {
    return docPart => {
      console.log('document:ready', docPart)
      const doc = this._processDocPart(docPart)
      this.emit('document:ready', doc)
    }
  }

  _onDocumentUpdated () {
    return docPart => {
      const doc = this._processDocPart(docPart)
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
