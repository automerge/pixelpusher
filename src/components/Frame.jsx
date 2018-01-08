import React from 'react';
import { List } from 'immutable';
import Preview from './Preview';

export default class Frame extends React.Component {
  handleClick() {
    this.props.actions.changeActiveFrame(this.props.frameIndex);
  }

  deleteFrame(e) {
    e.stopPropagation();
    if (this.props.active) {
      this.props.actions.deleteFrame(this.props.frameIndex);
    }
  }

  duplicateFrame(e) {
    e.stopPropagation();
    if (this.props.active) {
      this.props.actions.duplicateFrame(this.props.frameIndex);
    }
  }

  changeInterval(e) {
    e.stopPropagation();
    if (this.props.active) {
      this.props.actions.changeFrameInterval(
        this.props.frameIndex,
        this.percentage.value
      );
    }
  }

  render() {
    const {active, lastFrame, frameIndex} = this.props;
    const project = this.props.project.set('cellSize', 2)
    const frame = project.getIn(['frames', frameIndex]);

    return (
      <div
        className={`frame${active ? ' active' : ''}`}
        onClick={() => { this.handleClick(); }}
      >
        <Preview
          project={project}
          frameIndex={frameIndex}
        />
        <button
          className="delete"
          onClick={(event) => { this.deleteFrame(event); }}
        />
        <button
          className="duplicate"
          onClick={(event) => { this.duplicateFrame(event); }}
        />
        <input
          type="number"
          value={frame.get('interval')}
          onChange={(event) => { this.changeInterval(event); }}
          className="frame__percentage"
          ref={(c) => { this.percentage = c; }}
          disabled={lastFrame || !active}
        />
      </div>
    );
  }
}
