import {is} from 'immutable'

export default (store, path, f) => {
  let pState = store.getState().present.getIn(path)

  store.subscribe(() => {
    const state = store.getState().present.getIn(path)

    if (pState != null && state != null && !is(pState, state)) {
      f(state, pState)
      pState = state
    }
  })
}
