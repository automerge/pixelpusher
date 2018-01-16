import React from 'react';
import PixelCanvasContainer from './PixelCanvas';
import CellSizeContainer from './CellSize';
import ColorPickerContainer from './ColorPicker';
import ModalContainer from './Modal';
import DimensionsContainer from './Dimensions';
import CssDisplayContainer from './CssDisplay';
import DurationContainer from './Duration';
import EraserContainer from './Eraser';
import BucketContainer from './Bucket';
import EyedropperContainer from './Eyedropper';
import FramesHandlerContainer from './FramesHandler';
import PaletteGridContainer from './PaletteGrid';
import ResetContainer from './Reset';
import NewProjectContainer from './NewProject';
import CloneProjectContainer from './CloneProject';
import SimpleNotificationContainer from './SimpleNotification';
import SimpleSpinnerContainer from './SimpleSpinner';
import PresenceContainer from './PresenceContainer';
import DebugInfoContainer from './DebugInfoContainer';
import ShareLinkContainer from './ShareLinkContainer';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      modalType: null,
      modalOpen: false,
      helpOn: false,
      showCookiesBanner: false
    };
  }

  changeModalType(type) {
    this.setState({
      modalType: type,
      modalOpen: true
    });
  }

  closeModal() {
    this.setState({
      modalOpen: false
    });
  }

  hideCookiesBanner() {
    this.setState({
      showCookiesBanner: false
    });
  }

  toggleHelp() {
    this.setState({ helpOn: !this.state.helpOn });
  }

  tip(text) {
    return this.state.helpOn ? text : null
  }

  render() {
    return (
      <div>
        {this.renderHeader()}
        <div className="app__main">
          <SimpleSpinnerContainer />
          <SimpleNotificationContainer
            fadeInTime={1000}
            fadeOutTime={1500}
            duration={1500}
          />
          <div className="app__central-container">
            {this.renderLeftSide()}
            <div className="app__center">
              <PixelCanvasContainer />
              <div
                className="app__frames-container"
                data-tooltip={this.tip(
                  `Create an awesome animation secuence.
                  You can modify the duration of each frame, changing its own value.
                  The number indicates where the frame ends in a range from 0 to 100.
                  `)}>
                <FramesHandlerContainer />
              </div>
            </div>
            {this.renderRightSide()}
          </div>
          <div className="css-container">
            <CssDisplayContainer />
          </div>

          <ModalContainer
            type={this.state.modalType}
            isOpen={this.state.modalOpen}
            close={() => { this.closeModal(); }}
            open={() => { this.changeModalType(this.state.modalType); }}
          />
        </div>
      </div>
    );
  }

  renderHeader() {
    return (
      <header>
        <h1>PIXELPUSHER</h1>
        <div className="sharelink">
          <ShareLinkContainer />
        </div>
        <div className="menu">
          <button
            className="app__load-button"
            onClick={() => { this.changeModalType('load'); }}
            data-tooltip={this.tip('Load projects you stored before')}>
            Projects
          </button>

          <div data-tooltip={this.tip('Clone project')}>
            <CloneProjectContainer />
          </div>
        </div>
      </header>
    );
  }

  renderLeftSide() {
    return (
      <div className="app__left-side">
        <div>
          <div>
            <button
              className="app__preview-button"
              onClick={() => { this.changeModalType('preview'); }}
              data-tooltip={this.tip('Show a preview of your project')}
            >
              Preview
            </button>
            <div data-tooltip={this.tip('Reset the selected frame')}>
              <ResetContainer />
            </div>
          </div>

          <div>
            <div className="app__tools-wrapper grid-2">
              <div data-tooltip={this.tip('Remove colors')}>
                <EraserContainer />
              </div>
              <div data-tooltip={this.tip('Sample a color from your drawing')}>
                <EyedropperContainer />
              </div>
              <div data-tooltip={this.tip('It fills an area of the current frame based on color similarity')}>
                <BucketContainer />
              </div>
              <div data-tooltip={this.tip('Choose a new color that is not in your palette')}>
                <ColorPickerContainer />
              </div>
            </div>
          </div>
          <div>
            <PaletteGridContainer />
          </div>
        </div>
        <div>
          <div data-tooltip={this.tip('Size of one tile in px')}>
            <CellSizeContainer />
          </div>
          <div data-tooltip={this.tip('Animation duration in seconds')}>
            <DurationContainer />
          </div>
          <div data-tooltip={this.tip('Number of columns and rows')}>
            <DimensionsContainer />
          </div>
          <div className="credits">
            <h2>
              Originally by <a target="_blank" href="http://www.jvalen.com/">JVALEN</a>
            </h2>
            <iframe src="https://ghbtns.com/github-btn.html?user=jvalen&amp;repo=pixel-art-react&amp;type=star&amp;count=true" frameBorder="0" scrolling="0" width="100px" height="20px"></iframe>
          </div>
        </div>
      </div>
    );
  }

  renderRightSide() {
    return (
      <div className="app__right-side">
        <div>
          <PresenceContainer />
          <DebugInfoContainer />
        </div>
      </div>
    );
  }
}
