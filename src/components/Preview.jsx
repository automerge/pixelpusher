import React from 'react';
import { StyleRoot } from 'radium';
import {
  generatePixelDrawCss,
  generateAnimationCSSData,
  generateAnimationIntervals
} from '../utils/cssParse';
import Animation from './Animation';

const Preview = (props) => {
  const { frameIndex, duration, animate } = props;
  const {project} = props;
  const frames = project.get('frames')
  const columns = project.get('columns')
  const rows = project.get('rows')
  const cellSize = project.get('cellSize')

  const generatePreview = () => {
    const animation = frames.size > 1 && animate;
    let animationData;
    let cssString;

    const styles = {
      previewWrapper: {
        height: cellSize,
        width: cellSize
      }
    };

    if (animation) {
      animationData =
      generateAnimationCSSData(
        frames, generateAnimationIntervals(frames),
        columns, rows, cellSize
      );
    } else {
      cssString = generatePixelDrawCss(
        frames.get(frameIndex),
        columns, rows, cellSize, 'string'
      );

      styles.previewWrapper.boxShadow = cssString;
      styles.previewWrapper.MozBoxShadow = cssString;
      styles.previewWrapper.WebkitBoxShadow = cssString;
    }

    return (
      <div style={animation ? null : styles.previewWrapper}>
        {animation ?
          <StyleRoot>
            <Animation
              duration={duration}
              boxShadow={animationData}
            />
          </StyleRoot>
          : null
        }
      </div>
    );
  };

  const style = {
    width: columns * cellSize,
    height: rows * cellSize
  };

  return (
    <div className="preview" style={style}>
      {generatePreview()}
    </div>
  );
};
export default Preview;
