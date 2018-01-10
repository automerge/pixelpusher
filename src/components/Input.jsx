import React from 'react'
import {clipboard} from 'electron'

export default class Input extends React.Component {
  render() {
    const {onChange, autoCopy, ...props} = this.props

    return (
      <input
        className="input"
        onFocus={autoCopy ? this.copySelf : null}
        onChange={e => onChange(e.target.value)}
        {...props}
      />
    )
  }

  copySelf = e => {
    e.target.select()
    clipboard.writeText(e.target.value)
  }
}
