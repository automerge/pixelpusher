import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actionCreators from '../store/actions/actionCreators';
import GridWrapper from './GridWrapper';
import { getProject } from '../store/reducers/reducerHelpers';

const PixelCanvas = (props) => {
  const {project, activeFrameIndex} = props;

  if (!project) return <div>Loading...</div>;

  const columns = project.get('columns');
  const palette = project.get('palette');
  const emptyColor = project.get('defaultColor');
  const frames = project.get('frames');
  const activeFrame = frames.get(activeFrameIndex);

  const cells = activeFrame.get('pixels').map((swatchIndex, i) => {
    return {
      id: i,
      width: 100 / columns,
      color: palette.getIn([swatchIndex, 'color']) || emptyColor,
    };
  });

  const onCellEvent = id => props.actions.drawCell(id);

  let gridExtraClass = 'cell';
  if (props.eraserOn) {
    gridExtraClass = 'context-menu';
  } else if (props.eyedropperOn) {
    gridExtraClass = 'copy';
  }

  return (
    <GridWrapper
      cells={cells}
      onCellEvent={onCellEvent}
      extraClass={gridExtraClass}
    />
  );
};

const mapStateToProps = (state) => {
  const project = getProject(state.present);

  return {
    project,
    activeFrameIndex: state.present.activeFrameIndex,
    eyedropperOn: state.present.eyedropperOn,
    eraserOn: state.present.eraserOn,
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

const PixelCanvasContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PixelCanvas);
export default PixelCanvasContainer;
