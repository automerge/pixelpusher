import React from 'react'
import Automerge from 'automerge'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actionCreators from '../store/actions/actionCreators'
import GridWrapper from './GridWrapper'
import { getProjectPreview } from '../store/reducers/reducerHelpers'

const PixelCanvas = (props) => {
  let {project, activeFrameIndex} = props

  if (!project || !project.getIn(['doc', 'relativeId'])) return <div>Loading...</div>
  const {doc} = project

  const columns = doc.get('columns')
  const palette = doc.get('palette')
  const emptyColor = doc.get('defaultColor')
  const frames = doc.get('frames')
  const activeFrame = frames.get(activeFrameIndex)
  const pixels = activeFrame.get('pixels')
  const conflicts = Automerge.getConflicts(doc, pixels)

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

  const onCellEvent = id => props.actions.drawCell(id)

  let gridExtraClass = 'cell'
  if (props.eraserOn) {
    gridExtraClass = 'context-menu'
  } else if (props.eyedropperOn) {
    gridExtraClass = 'copy'
  }

  return (
    <GridWrapper
      cells={cells}
      onCellEvent={onCellEvent}
      extraClass={gridExtraClass}
    />
  )
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
