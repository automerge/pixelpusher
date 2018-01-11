import {is} from 'immutable'

export default (store, getter, f) => {
  let pState = getter(store.getState().present)

  if (pState != null) f(pState)

  store.subscribe(() => {
    const state = getter(store.getState().present)

    if (state != null && !is(pState, state)) {
      f(state, pState)
      pState = state
    }
  })
}
