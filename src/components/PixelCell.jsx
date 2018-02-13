import React from 'react'
import {is} from 'immutable'
import classnames from 'classnames'
import PixelConflictContainer from './PixelConflictContainer'

export default class PixelCell extends React.Component {
  shouldComponentUpdate (nextProps) {
    const keys = ['color', 'width']
    const isSame = keys.every(key => this.props.cell[key] === nextProps.cell[key]) &&
      is(this.props.cell.conflicts, nextProps.cell.conflicts)

    return !isSame
  }

  render () {
    const {
      id, cell: { color, width, conflicts, project, swatchIndex },
      onMouseDown, onMouseOver, onTouchMove
    } = this.props

    const conflicting = conflicts && conflicts.groupBy(x => x).size > 1

    const styles = {
      width: `calc(${width}% - 1px)`,
      paddingBottom: `${width}%`,
      backgroundColor: color
    }

    return (
      <div
        className={classnames({ conflicting })}
        onMouseDown={ev => onMouseDown(id, ev)}
        onMouseOver={ev => onMouseOver(id, ev)}
        onTouchStart={ev => onMouseDown(id, ev)}
        onTouchMove={ev => onTouchMove(id, ev)}
        style={styles}
      >
        { conflicts
          ? <PixelConflictContainer
            index={id}
            swatchIndex={swatchIndex}
            project={project}
            conflicts={conflicts}
            />
          : null}
      </div>
    )
  }
}
