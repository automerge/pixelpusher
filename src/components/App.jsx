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
import SaveDrawingContainer from './SaveDrawing';
import NewProjectContainer from './NewProject';
import SimpleNotificationContainer from './SimpleNotification';
import SimpleSpinnerContainer from './SimpleSpinner';
import UndoRedoContainer from './UndoRedo';
import initialSetup from '../utils/startup';

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

  componentDidMount() {
    initialSetup(this.props.dispatch, localStorage);
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
          <div
            className="app__frames-container"
            data-tooltip={this.tip(
              `Create an awesome animation secuence.
              You can modify the duration of each frame, changing its own value.
              The number indicates where the frame ends in a range from 0 to 100.
              `)}>
            <FramesHandlerContainer />
          </div>
          <div className="app__central-container">
            <div className="left col-1-4">
              <div className="app__left-side">
                <div className="app__mobile--container">
                  <div className="app__mobile--group">
                    <div data-tooltip={this.tip('Undo Redo actions')}>
                      <UndoRedoContainer />
                    </div>
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
                  <div className="app__mobile--group">
                    <PaletteGridContainer />
                  </div>
                </div>
                <div className="app__mobile--container">
                  <div className="app__mobile--group">
                    <button
                      className="app__copycss-button"
                      onClick={() => { this.changeModalType('copycss'); }}
                      data-tooltip={this.tip('Check your CSS generated code')}
                    >
                      css
                    </button>
                  </div>
                  <div className="app__mobile--group">
                    <div className="app__social-container">
                      <div data-tooltip={this.tip('Tweet your creation in different formats')}>
                        <button
                          className="app__twitter-button"
                          onClick={() => { this.changeModalType('twitter'); }}
                        />
                      </div>
                      <div data-tooltip={this.tip('Download your creation in different formats')}>
                        <button
                          className="app__download-button"
                          onClick={() => { this.changeModalType('download'); }}
                        />
                      </div>
                      <div data-tooltip="Toggle help tooltips">
                        <button
                          className={`app__toggle-help-button ${this.tip(' selected')}`}
                          onClick={() => { this.toggleHelp(); }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="center col-2-4">
              <PixelCanvasContainer />
            </div>
            <div className="right col-1-4">
              <div className="app__right-side">
                <div className="app__mobile--container">
                  <div className="app__mobile--group">
                    <button
                      className="app__preview-button"
                      onClick={() => { this.changeModalType('preview'); }}
                      data-tooltip={this.tip('Show a preview of your project')}
                    >
                      PREVIEW
                    </button>
                    <div data-tooltip={this.tip('Reset the selected frame')}>
                      <ResetContainer />
                    </div>
                    <div data-tooltip={this.tip('Number of columns and rows')}>
                      <DimensionsContainer />
                    </div>
                  </div>
                  <div className="app__mobile--group">
                    <div data-tooltip={this.tip('Size of one tile in px')}>
                      <CellSizeContainer />
                    </div>
                    <div data-tooltip={this.tip('Animation duration in seconds')}>
                      <DurationContainer />
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
        <div className="col-1-3">
          <h1>PIXELPUSHER</h1>
        </div>
        <div className="menu col-2-3">
          <button
            className="app__load-button"
            onClick={() => { this.changeModalType('load'); }}
            data-tooltip={this.tip('Load projects you stored before')}>
            Documents
          </button>

          <div data-tooltip={this.tip('New project')}>
            <NewProjectContainer />
          </div>

          <div  data-tooltip={this.tip('Save your project')}>
            <SaveDrawingContainer />
          </div>
        </div>
      </header>
    );
  }
}
