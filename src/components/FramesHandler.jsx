import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Scrollbars } from 'react-custom-scrollbars';
import * as actionCreators from '../store/actions/actionCreators';
import Frame from './Frame';
import { getProjectPreview } from '../store/reducers/reducerHelpers';

class FramesHandler extends React.Component {
  state = { newFrame: false }

  onScrollbarUpdate() {
    if (this.state.newFrame) {
      this.setState({ newFrame: false });
      this.scrollbars.scrollToRight();
    }
  }

  renderFrames() {
    const {project} = this.props

    const {doc} = project

    if (!doc || !doc.get('frames')) return null

    return doc.get('frames').map((frame, index, frames) =>
      <Frame
        key={frame.get('id')}
        project={project}
        frameIndex={index}
        active={this.props.activeFrameIndex === index}
        lastFrame={frames.size - 1 === index}
        actions={{
          changeActiveFrame: this.props.actions.changeActiveFrame,
          deleteFrame: this.props.actions.deleteFrame,
          duplicateFrame: this.props.actions.duplicateFrame,
          changeFrameInterval: this.props.actions.changeFrameInterval
        }}
      />
    );
  }

  handleClick() {
    this.props.actions.createNewFrame();
    this.setState({ newFrame: true });
  }


  render() {
    const {project} = this.props

    if (!project) return null

    return (
      <div className="frames-handler">
        <div className="frames-handler__list">
          <Scrollbars
            hideTracksWhenNotNeeded
            autoHeight
            autoHide
            ref={(c) => { this.scrollbars = c; }}
            onUpdate={() => { this.onScrollbarUpdate(); }}
          >
            <div className="list__container">
              {this.renderFrames()}
            </div>
          </Scrollbars>
        </div>
        <button
          className="frames-handler__add"
          onClick={() => { this.handleClick(); }}
        >
          +
      </button>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  project: getProjectPreview(state),
  activeFrameIndex: state.get('activeFrameIndex')
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

const FramesHandlerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FramesHandler);
export default FramesHandlerContainer;
