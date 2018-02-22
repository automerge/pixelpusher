import { createStore, applyMiddleware } from 'redux'
import reducer from '../store/reducers/reducer'
import Hypermerge from 'hypermerge'
import hypermergeRedux from '../lib/hypermerge-redux'
import * as Init from '../logic/Init'
import {mapAction} from './hypermergeHelpers'
import { CLIENT_ID, STORAGE_PATH, getStateFromStorage } from '../utils/storage'

const configureStore = devMode => {
  document.title = `pixelpusher client ${CLIENT_ID}`

  const sync = global.sync = new Hypermerge({
    port: 3282 + CLIENT_ID,
    path: STORAGE_PATH,
    immutableApi: true
  })

  const addDepDocs = (id, doc) => {
    const metadata = sync.metadata(id)

    switch (metadata.type) {
      case 'Project':
        return sync.metadatas(id).map(m => sync.open(m.identityId))

      case 'Identity':
        return doc.get('avatarId') && sync.open(doc.get('avatarId'))
    }
  }

  sync.on('document:ready', addDepDocs)
  sync.on('document:updated', addDepDocs)

  const init = ({type}) => {
    switch (type) {
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

  sync.once('ready', () => {
    if (state.identityId) {
      sync.defaultMetadata = {
        identityId: state.identityId
      }
    } else {
      let doc = sync.create({type: 'Identity'})
      doc = Init.identity(doc)
      sync.update(doc)

      const id = sync.getId(doc)

      sync.defaultMetadata = {
        identityId: id
      }

      store.dispatch({type: 'IDENTITY_CREATED', id, doc})
      store.dispatch({type: 'NEW_PROJECT_CLICKED'})
    }

    sync.joinSwarm()
  })

  return store
}

export default configureStore
