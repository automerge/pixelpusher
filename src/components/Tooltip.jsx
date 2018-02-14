import React from 'react'

export default class Tooltip extends React.Component {
  render () {
    const {text, ...rest} = this.props
    return (
      <div className='Tooltip' data-tooltip={text} {...rest} />
    )
  }
}
