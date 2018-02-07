import { createStore, applyMiddleware } from 'redux'
import reducer from '../store/reducers/reducer'
import HyperMerge from 'hypermerge/HyperMerge'
import hypermergeRedux from '../lib/hypermerge-redux'
import * as Init from '../logic/Init'

const configureStore = (devMode) => {
  const clientId = +(process.env.CLIENT_ID || 0)

  document.title = `pixelpusher client ${clientId}`

  const sync = global.sync = new HyperMerge({
    port: 3282 + clientId,
    path: `./.data/pixelpusher-v7/client-${clientId}`
  })

  const init = Init.project

  return createStore(
    reducer,
    applyMiddleware(
      hypermergeRedux(sync, {init})
    ))
}

export default configureStore
