import React from 'react';
import { connect } from 'react-redux';
import { generatePixelDrawCss } from '../utils/cssParse';
import { getProject } from '../store/reducers/reducerHelpers';

const CssDisplay = (props) => {
  const generateCss = () => {
    const { project, activeFrameIndex } = props;

    if (!project) return null;

    const cellSize = project.get('cellSize');

    let cssString = generatePixelDrawCss(project, activeFrameIndex, 'string');

    if (cssString) {
      cssString = `box-shadow: ${cssString}; `;
      cssString += `height: ${cellSize}px; width: ${cellSize}px;`;
    }

    return <div>{cssString}</div>;
  };

  return (
    <div className="css-display">
      {generateCss()}
    </div>
  );
};

function mapStateToProps(state) {
  const project = getProject(state);

  return {
    project,
    activeFrameIndex: state.get('activeFrameIndex'),
  };
}

const CssDisplayContainer = connect(
  mapStateToProps
)(CssDisplay);
export default CssDisplayContainer;
