import { createStore, applyMiddleware } from 'redux'
import reducer from '../store/reducers/reducer'
import HyperMerge from 'hypermerge/HyperMerge'
import hypermergeRedux from '../lib/hypermerge-redux'
import * as Init from '../logic/Init'
import {mapAction} from './hypermergeHelpers'
import { CLIENT_ID, STORAGE_PATH, getStateFromStorage } from '../utils/storage'

const configureStore = devMode => {
  document.title = `pixelpusher client ${CLIENT_ID}`

  const sync = global.sync = new HyperMerge({
    port: 3282 + CLIENT_ID,
    path: STORAGE_PATH
  })

  sync.joinSwarm()

  const addDepDocs = (docId, doc) => {
    const metadata = sync.metadata(docId)

    if (!metadata) {
      console.log('no metadata', docId)
      return
    }

    switch (metadata.type) {
      case 'Project':
        return sync.open(metadata.identityId)
      case 'Identity':
        return doc.get('avatarId') && sync.open(doc.get('avatarId'))
    }
  }

  // sync.on('document:ready', addDepDocs)
  // sync.on('document:updated', addDepDocs)

  const init = ({type}) => {
    switch (type) {
      case 'Identity':
        return Init.identity
      case 'Project':
        return Init.project
      default:
        throw new Error(`Unknown document type: ${type}.`)
    }
  }

  const state = getStateFromStorage()

  const store = createStore(
    reducer,
    state,
    applyMiddleware(
      hypermergeRedux(sync, {init, map: mapAction(sync)})
    ))

  if (!state.identityId) {
    sync.once('ready', () => {
      store.dispatch({type: 'CREATE_DOCUMENT', metadata: {type: 'Identity'}})
      store.dispatch({type: 'NEW_PROJECT_CLICKED'})
    })
  }

  return store
}

export default configureStore
