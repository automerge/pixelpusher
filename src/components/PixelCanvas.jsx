import React from 'react'
import Automerge from 'automerge'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actionCreators from '../store/actions/actionCreators'
import GridWrapper from './GridWrapper'
import { getProjectPreview } from '../store/reducers/reducerHelpers'

class PixelCanvas extends React.Component {

  render () {
    let {project, activeFrameIndex} = this.props

    if (!project || !project.isLoaded) {
      return this.empty('Loading...')
    }

    const {doc} = project
    const columns = doc.get('columns')
    const palette = doc.get('palette')
    const emptyColor = doc.get('defaultColor')
    const frames = doc.get('frames')
    const activeFrame = frames.get(activeFrameIndex)

    if (!activeFrame) {
      return this.empty('No frames. Click + below')
    }

    const pixels = activeFrame.get('pixels')
    const conflicts = Automerge.getConflicts(doc, pixels)

    const readonly = !project.isWritable

    const cells = pixels.map((swatchIndex, i) => {
      return {
        id: i,
        project,
        conflicts: conflicts.get(i),
        width: 100 / columns,
        swatchIndex,
        color: palette.getIn([swatchIndex, 'color']) || emptyColor
      }
    })

    let gridExtraClass = 'cell'
    if (this.props.eraserOn) {
      gridExtraClass = 'context-menu'
    } else if (this.props.eyedropperOn) {
      gridExtraClass = 'copy'
    }

    if (readonly) {
      gridExtraClass += ' readonly'
    }

    return (
      <GridWrapper
        cells={cells}
        onCellEvent={this.onCellEvent}
        extraClass={gridExtraClass}
      />
    )
  }

  empty(children) {
    return (
      <div className="empty-grid">
        {children}
      </div>
    )
  }

  onCellEvent = id => {
    if (!this.props.project.isWritable) return

    this.props.actions.drawCell(id)
  }
};

const mapStateToProps = (state) => {
  return {
    project: getProjectPreview(state),
    mergePreviewProjectId: state.mergePreviewProjectId,
    activeFrameIndex: state.activeFrameIndex,
    eyedropperOn: state.eyedropperOn,
    eraserOn: state.eraserOn
  }
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch)
})

const PixelCanvasContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PixelCanvas)
export default PixelCanvasContainer
