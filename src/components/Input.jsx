import React from 'react'

export default ({onChange, ...props}) =>
  <input
    className="input"
    onChange={e => onChange(e.target.value)}
    {...props}
  />
