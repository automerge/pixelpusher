import React from 'react'
import Automerge from 'automerge'
import { connect } from 'react-redux';

import * as Versions from '../logic/Versions'
import { shareLinkForProjectId } from '../utils/shareLink';
import { getProjectId, getProjectPreview } from '../store/reducers/reducerHelpers';

class PixelConflict extends React.Component {
  render() {
    const {conflicts, swatchIndex, project} = this.props

    return (
      <div className="PixelConflict">
        <div className="PixelConflict_Pixels">
          {this.renderConflict(swatchIndex, project.id)}
          {conflicts.map(this.renderConflict).valueSeq()}
        </div>
      </div>
    )
  }

  renderConflict = (swatchIndex, actor) => {
    const {project, projects, identities} = this.props
    const emptyColor = project.getIn(['doc', 'defaultColor'])
    const backgroundColor = project.getIn(['doc', 'palette', swatchIndex, 'color']) || emptyColor
    const identityId = projects.getIn([actor, 'identityId'])
    const identity = identities.get(identityId)
    const color = identity && Versions.color(identity)

    return (
      <div
        key={actor}
        className="PixelConflict_Pixel"
        onMouseDown={this.clicked(swatchIndex)}
        style={{backgroundColor, color}}
      />
    )
  }

  clicked = swatchIndex => e => {
    e.stopPropagation()
    const {index, dispatch} = this.props

    dispatch({type: 'PIXEL_CONFLICT_CLICKED', index, swatchIndex})
  }
}

const mapStateToProps = state => ({
  project: getProjectPreview(state),
  projects: state.projects,
  identities: state.identities
});

const mapDispatchToProps = dispatch => ({
  dispatch,
});

const PixelConflictContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PixelConflict);
export default PixelConflictContainer;
