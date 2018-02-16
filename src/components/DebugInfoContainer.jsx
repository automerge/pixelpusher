import React from 'react'
import { connect } from 'react-redux'
import { getProjectId } from '../store/reducers/reducerHelpers'

class DebugInfo extends React.Component {
  render () {
    const {state} = this.props

    return (
      <pre style={{textAlign: 'center'}}>
        {getProjectId(state)}
      </pre>
    )
  }
}

const mapStateToProps = state => ({
  state
})

const DebugInfoContainer = connect(
  mapStateToProps,
  null
)(DebugInfo)

export default DebugInfoContainer
