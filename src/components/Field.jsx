import React from 'react'
import classnames from 'classnames'
import {clipboard} from 'electron'

export default class Field extends React.Component {
  render() {
    const {label, onChange, autoCopy, autoSelect, onClick, invalid, children, ...props} = this.props
    const click =
        onClick ? onClick
      : autoCopy ? this.copySelf
      : autoSelect ? this.selectSelf
      : null

    return (
      <label
        className={classnames("field", {
          "field-invalid": invalid
        })}>
        { label
          ? <Field.Label>{label}</Field.Label>
          : null
        }

        <input
          className="field__input"
          onClick={click}
          onChange={e => onChange(e.target.value, e)}
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
      <div className={`field__label`} {...rest} />
    )
  }
}

Field.Label = Label

export class Button extends React.Component {
  render() {
    const {type, ...rest} = this.props

    return (
      <button type="button" className={`field__button field__button-${type}`} {...rest} />
    )
  }
}

Field.Button = Button
