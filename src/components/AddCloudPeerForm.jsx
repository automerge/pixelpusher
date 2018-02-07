import React from 'react'
import Field from './Field'

export default class AddCloudPeerForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {key: ''}
  }

  click () {
    let key
    try {
      key = /^(dat:\/\/)?([0-9a-f]{64})$/i.exec(this.state.key)[2]
      if (!key) throw new Error('Missing key')
      this.props.onAdd(key)
    } catch (e) {
      this.setState({
        validationError: 'Invalid key'
      })
    }
  }

  render () {
    return (
      <div>
        <h3>Add Archiver</h3>
        <Field
          label="Archiver Key"
          value={this.state.key}
          onChange={key => this.setState({key, validationError: null})}
        />
        {this.state.validationError}
        <button onClick={this.click.bind(this)}>Add</button>
      </div>
    )
  }
}
