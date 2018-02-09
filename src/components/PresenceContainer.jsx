import React from 'react'
import { connect } from 'react-redux'

import { getProject, getOwnIdentity } from '../store/reducers/reducerHelpers'
import * as Versions from '../logic/Versions'
import Field from './Field'
import Canvas from './Canvas'

class Presence extends React.Component {
  render () {
    const {ownIdentity, dispatch} = this.props
    if (!ownIdentity) return null

    return (
      <div>
        {this.renderPeers()}
        <Field
          label='Your Name'
          value={ownIdentity.doc.get('name')}
          onChange={name => dispatch({type: 'SELF_NAME_CHANGED', name})}
        />
      </div>
    )
  }

  renderPeers () {
    const {project, peers, identities} = this.props

    return peers
      .valueSeq()
      .filter(peer => peer.projectId === project.id)
      .map(peer => {
        const identity = identities.get(peer.identityId)
        const color = identity && Versions.color(identity)

        return (
          <div className='peer' style={{color}}>
            <Canvas
              project={project}
            />
          </div>
        )
      })
  }
}

const mapStateToProps = state => ({
  identities: state.identities,
  peers: state.peers,
  projects: state.projects,
  ownIdentity: getOwnIdentity(state),
  project: getProject(state)
})

const mapDispatchToProps = dispatch => ({
  dispatch
})

const PresenceContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Presence)
export default PresenceContainer
