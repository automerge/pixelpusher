import React from 'react'
import { StyleRoot } from 'radium'
import {
  generatePixelDrawCss,
  generateAnimationCSSData
} from '../utils/cssParse'
import Animation from './Animation'

const Preview = (props) => {
  const { frameIndex, duration, animate, width } = props
  const {project} = props
  const {doc} = project
  const frames = doc.get('frames')
  const columns = doc.get('columns')
  const rows = doc.get('rows')
  const cellSize = doc.get('cellSize')

  if (frames.size === 0) return null

  const generatePreview = () => {
    const animation = frames.size > 1 && animate
    let animationData
    let cssString

    const styles = {
      previewWrapper: {
        height: cellSize,
        width: cellSize
      }
    }

    if (animation) {
      animationData =
      generateAnimationCSSData(doc)
    } else {
      cssString = generatePixelDrawCss(doc, frameIndex, 'string')

      styles.previewWrapper.boxShadow = cssString
      styles.previewWrapper.MozBoxShadow = cssString
      styles.previewWrapper.WebkitBoxShadow = cssString
    }

    return (
      <div style={animation ? null : styles.previewWrapper}>
        {animation
          ? <StyleRoot>
            <Animation
              duration={duration}
              boxShadow={animationData}
            />
          </StyleRoot>
          : null
        }
      </div>
    )
  };

  const style = {
    width: columns * cellSize,
    height: rows * cellSize,
    transform: `scale(${width ? width / (columns * cellSize) : 1})`
  }

  return (
    <div className='preview' style={style}>
      {generatePreview()}
    </div>
  )
};
export default Preview
