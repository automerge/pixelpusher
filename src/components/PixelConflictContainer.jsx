import React from 'react'
import Automerge from 'automerge'
import { connect } from 'react-redux';

import { shareLinkForProjectId } from '../utils/shareLink';
import { getProjectId, getProject } from '../store/reducers/reducerHelpers';

class PixelConflict extends React.Component {
  render() {
    const {conflicts, swatchIndex, project} = this.props

    return (
      <div className="PixelConflict">
        <div className="PixelConflict_Pixels">
          {this.renderConflict(swatchIndex, project._actorId)}
          {conflicts.map(this.renderConflict).valueSeq()}
        </div>
      </div>
    )
  }

  renderConflict = (swatchIndex, actor) => {
    const {project} = this.props
    const color = project.getIn(['palette', swatchIndex, 'color'])

    return (
      <div
        key={actor}
        className="PixelConflict_Pixel"
        onMouseDown={this.clicked(swatchIndex)}
        style={{backgroundColor: color}}
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
  project: getProject(state.present),
});

const mapDispatchToProps = dispatch => ({
  dispatch,
});

const PixelConflictContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PixelConflict);
export default PixelConflictContainer;
