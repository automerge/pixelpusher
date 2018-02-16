import React from 'react'
import { connect } from 'react-redux'
import * as Versions from '../logic/Versions'

import Canvas from './Canvas'

class Avatar extends React.Component {
  render () {
    const {identity, avatar} = this.props

    const color = identity && Versions.color(identity)

    if (!identity) return null

    return (
      <div className='version__avatar' style={{color}}>
        { avatar
          ? <Canvas project={avatar} />
          : null}
      </div>
    )
  }
}

const mapStateToProps = (state, {identityId}) => {
  const identity = state.identities.get(identityId, null)
  const avatarId = identity && identity.getIn(['doc', 'avatarId'])
  const avatar = avatarId && state.projects.get(avatarId)

  return {
    identity,
    avatar
  }
}

const mapDispatchToProps = dispatch => ({
  dispatch
})

const AvatarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Avatar)

export default AvatarContainer
