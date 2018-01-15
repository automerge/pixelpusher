import React from 'react'
import {clipboard} from 'electron'

export default class Input extends React.Component {
  render() {
    const {onChange, autoCopy, autoSelect, onClick, ...props} = this.props
    const click =
        onClick ? onClick
      : autoCopy ? this.copySelf
      : autoSelect ? this.selectSelf
      : null

    return (
      <input
        className="input"
        onClick={click}
        onChange={e => onChange(e.target.value)}
        {...props}
      />
    )
  }

  copySelf = e => {
    selectSelf(e)
    clipboard.writeText(e.target.value)
  }

  selectSelf = e => {
    e.target.select()
  }
}
