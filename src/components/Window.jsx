import {Component} from 'react'

export default class Window extends Component {
  static eventNames = {
    unload: 'onUnload',
    load: 'onLoad',
    resize: 'onResize',
    keydown: 'onKeyDown',
    keyup: 'onKeyUp',
    keypress: 'onKeyPress',
    mouseup: 'onMouseUp',
    touchend: 'onTouchEnd',
    touchcancel: 'onTouchCancel'
  }

  componentDidMount() {
    eachEvent((prop, name) => {
      let fn

      if (fn = this.props[prop]) {
        window.addEventListener(name, fn)
      }
    })
  }

  componentWillUnmount() {
    eachEvent((prop, name) => {
      let fn

      if (fn = this.props[prop]) {
        window.removeEventListener(name, fn)
      }
    })
  }

  render() {
    return null
  }
}

const eachEvent = f => {
  for (let k in Window.eventNames)
    f(Window.eventNames[k], k)
}
