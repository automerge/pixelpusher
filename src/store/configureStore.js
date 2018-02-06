import { createStore, applyMiddleware } from 'redux'
import reducer from '../store/reducers/reducer'

const configureStore = (devMode) => {

  return createStore(
    reducer
  )
}

export default configureStore
