import {is} from 'immutable'

export default (store, path, f) => {
  let pState = store.getState().present.getIn(path)

  f(pState)

  store.subscribe(() => {
    const state = store.getState().present.getIn(path)

    if (state != null && !is(pState, state)) {
      f(state, pState)
      pState = state
    }
  })
}
