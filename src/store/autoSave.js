import {is} from 'immutable'
import {throttle} from 'lodash/fp'
import {saveProjectToStorage} from '../utils/storage'
import whenChanged from './whenChanged'

export default store => {
  const save = throttle(2000, saveNow)

  whenChanged(store, ['currentProject'], save)
}

export const saveNow = project => {
  console.log("Auto-saving")
  saveProjectToStorage(localStorage, project)
}
