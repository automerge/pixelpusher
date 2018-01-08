import {is} from 'immutable'
import {throttle} from 'lodash/fp'
import {saveProjectToStorage} from '../utils/storage'

export default store => {
  const save = throttle(2000, saveNow)
  let pState = store.getState()

  store.subscribe(() => {
    const state = store.getState()

    if (hasProjectChanged(state.present, pState.present)) {
      save(state.present)
    }
  })
}

export const hasProjectChanged = (a, b) =>
  a && b && a != b
  && !is(a.get('currentProject'), b.get('currentProject'))

export const saveNow = state => {
  console.log("Auto-saving")

  const project = state.get('currentProject')

  saveProjectToStorage(localStorage, project)
}
