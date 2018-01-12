import {is} from 'immutable'

export default (store, getter, f) => {
  let state = getter(store.getState().present)

  if (state != null) f(state)

  store.subscribe(() => {
    const pState = state
    const newState = getter(store.getState().present)

    if (!is(pState, newState)) {
      f(state = newState, pState)
    }
  })
}
