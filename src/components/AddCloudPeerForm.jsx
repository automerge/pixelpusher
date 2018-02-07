import React from 'react'
import Field from './Field'

export default class AddCloudPeerForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {key: ''}
  }

  click () {
    this.props.onAdd(this.state.key)
  }

  render () {
    return (
      <div>
        <h3>Add Cloud Peer</h3>
        <Field
          label="Cloud Peer Key"
          value={this.state.key}
          onChange={key => this.setState({key})}
        />
        <button onClick={this.click.bind(this)}>Add</button>
      </div>
    )
  }
}