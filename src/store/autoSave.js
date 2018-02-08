import {throttle} from 'lodash/fp'
import {saveStateToStorage} from '../utils/storage'
import whenChanged from './whenChanged'

export default store => {
  const save = throttle(2000, saveNow)

  whenChanged(store, state => state, () => {
    save(store.getState())
  })
}

export const saveNow = data => {
  // console.log("Auto-saving")

  saveStateToStorage(data)
}
