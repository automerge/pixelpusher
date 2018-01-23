import React from 'react'
import classnames from 'classnames'
import {clipboard} from 'electron'

export default class Button extends React.Component {
  render() {
    const {tiny, icon, ...rest} = this.props

    return (
      <button
        className={classnames("button", {
          "button-tiny": tiny,
          [`button-${icon}`]: icon,
        })}
        {...rest}
      />
    )
  }
}
