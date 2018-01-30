import React from 'react'
import classnames from 'classnames'
import {clipboard} from 'electron'

export default class Button extends React.Component {
  render() {
    const {tiny, small, icon, disabled, onClick, onMouseEnter, onMouseLeave, ...rest} = this.props

    return (
      <button
        className={classnames("button", {
          "button-tiny": tiny,
          "button-small": small,
          "button-disabled": disabled,
          [`button-${icon}`]: icon,
        })}
        onClick={disabled ? null : onClick}
        onMouseEnter={disabled ? null : onMouseEnter}
        onMouseLeave={disabled ? null : onMouseLeave}
        {...rest}
      />
    )
  }
}
