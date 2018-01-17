import React from 'react'
import {clipboard} from 'electron'

export default class Field extends React.Component {
  render() {
    const {label, onChange, autoCopy, autoSelect, onClick, children, ...props} = this.props
    const click =
        onClick ? onClick
      : autoCopy ? this.copySelf
      : autoSelect ? this.selectSelf
      : null

    return (
      <label className="input">
        { label
          ? <Field.Label>{label}</Field.Label>
          : null
        }

        <input
          className="input__input"
          onClick={click}
          onChange={e => onChange(e.target.value)}
          {...props}
        />
        {children}
      </label>
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

export class Label extends React.Component {
  render() {
    const {...rest} = this.props

    return (
      <div className={`input__label`} {...rest} />
    )
  }
}

Field.Label = Label

export class Button extends React.Component {
  render() {
    const {type, ...rest} = this.props

    return (
      <button type="button" className={`input__button input__button-${type}`} {...rest} />
    )
  }
}

Field.Button = Button
