import {is} from 'immutable'
import {throttle} from 'lodash/fp'
import {saveProjectToStorage} from '../utils/storage'

export default store => {
  const save = throttle(1000, saveNow)
  let pState = store.getState()

  store.subscribe(() => {
    const state = store.getState()

    if (hasProjectChanged(state.present, pState.present)) {
      save(state.present)
    }
  })
}

// in the future this will simply compare two Project records
export const hasProjectChanged = (a, b) =>
  a && b && a != b
  && !(
    is(a.get('frames'), b.get('frames'))
    && is(a.get('paletteGridData'), b.get('paletteGridData'))
    && is(a.get('cellSize'), b.get('cellSize'))
  )

export const saveNow = state => {
  console.log("Auto-saving")

  const projectData = {
    frames: state.get('frames'),
    paletteGridData: state.get('paletteGridData'),
    cellSize: state.get('cellSize'),
    columns: state.get('columns'),
    rows: state.get('rows'),
    id: state.get('currentProjectId'),
  }

  saveProjectToStorage(localStorage, projectData)
}
