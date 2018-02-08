import React from 'react'
import { connect } from 'react-redux'

import { getProjectId, getOwnIdentity } from '../store/reducers/reducerHelpers'
import Field from './Field'
import Preview from './Preview'

class Presence extends React.Component {
  render () {
    const {ownIdentity, dispatch} = this.props
    if (!ownIdentity) return null

    return (
      <div>
        <Field
          label='Your Name'
          value={ownIdentity.doc.get('name')}
          onChange={name => dispatch({type: 'SELF_NAME_CHANGED', name})}
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  identities: state.identities,
  peers: state.peers,
  projects: state.projects,
  ownIdentity: getOwnIdentity(state),
  projectId: getProjectId(state)
})

const mapDispatchToProps = dispatch => ({
  dispatch
})

const PresenceContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Presence)
export default PresenceContainer
