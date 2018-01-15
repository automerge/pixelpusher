import React from 'react'
import {clipboard} from 'electron'

export default class Input extends React.Component {
  render() {
    const {onChange, autoCopy, autoSelect, onClick, children, ...props} = this.props
    const click =
        onClick ? onClick
      : autoCopy ? this.copySelf
      : autoSelect ? this.selectSelf
      : null

    return (
      <div className="input">
        <input
          className="input__input"
          onClick={click}
          onChange={e => onChange(e.target.value)}
          {...props}
        />
        {children}
      </div>
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

export class Button extends React.Component {
  render() {
    const {type, ...rest} = this.props

    return (
      <button type="button" className={`input__button input__button-${type}`} {...rest} />
    )
  }
}

Input.Button = Button
