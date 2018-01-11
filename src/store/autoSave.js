import {is} from 'immutable'
import {throttle} from 'lodash/fp'
import {saveStateToStorage, getStateFromStorage} from '../utils/storage'
import whenChanged from './whenChanged'
import { getProject } from './reducers/reducerHelpers';

export default store => {
  const save = throttle(2000, saveNow)

  const state = getStateFromStorage(localStorage)

  store.dispatch({type: "STATE_LOADED", state})

  whenChanged(store, getProject, () => {
    save(store.getState().present)
  })
}

export const saveNow = data => {
  console.log("Auto-saving")

  saveStateToStorage(localStorage, data)
}
