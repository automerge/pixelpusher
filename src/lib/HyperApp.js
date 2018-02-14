import { EventEmitter } from "events"
import HyperMerge from 'hypermerge/HyperMerge'

export default class HyperApp extends EventEmitter {
  constructor (opts) {
    super()

    this.hypermerge = new HyperMerge(opts)
  }
}
