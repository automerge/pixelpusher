import React from 'react'
import Automerge from 'automerge'
import {fromJS} from 'immutable'
import { connect } from 'react-redux';
import { shareLinkForProjectId } from '../utils/shareLink';
import { getProjectId } from '../store/reducers/reducerHelpers';
import Version from './Version';
import {related} from '../logic/Versions'

class History extends React.Component {
  render() {
    const {projectId, projects, dispatch} = this.props
    if (!projectId) return null

    const currentProject = projects.get(projectId)

    if (!currentProject) return null

    const history = Automerge.getHistory(currentProject).reverse()

    return (
      <div>
        <h3>History:</h3>
        {history.map(this.renderHistoryItem)}
      </div>
    )
  }

  renderHistoryItem = ({change}) => {
    const key = `${change.actor.slice(0, 4)}:${change.seq}`
    return (
      <div key={key}>
        {key}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  projects: state.projects,
  projectId: getProjectId(state),
});

const mapDispatchToProps = dispatch => ({
  dispatch,
});

const HistoryContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(History);
export default HistoryContainer;
