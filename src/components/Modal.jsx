import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ModalReact from 'react-modal';
import * as actionCreators from '../store/actions/actionCreators';

import RadioSelector from './RadioSelector';
import LoadDrawing from './LoadDrawing';
import Preview from './Preview';
import CopyCSS from './CopyCSS';
import DownloadDrawing from './DownloadDrawing';
import TwitterForm from './TwitterForm';
import AddCloudPeerForm from './AddCloudPeerForm';
import { getProject } from '../store/reducers/reducerHelpers';

ModalReact.setAppElement('#app');

class Modal extends React.Component {
  state = {
    previewType: 'single',
    loadType: 'storage',
  }

  getModalContent(props) {
    const project = props.project && props.project.updateIn(['doc', 'cellSize'], x =>
      props.type === 'preview' ? x : 5)

    const options = generateRadioOptions(props);
    let content;
    let radioOptions
    if (props.type === 'addCloudPeer') {
      radioOptions = null
    } else if (props.type !== 'load') {
      radioOptions = (
        <div className="modal__preview">
          <RadioSelector
            name="preview-type"
            selected={this.state.previewType}
            change={this.changeRadioType}
            options={options}
          />
          { project && this.state.previewType !== 'spritesheet' ?
            <div className="modal__preview--wrapper">
              <Preview
                key="0"
                project={project}
                duration={props.duration}
                frameIndex={props.activeFrameIndex}
                animate={this.state.previewType === 'animation'}
              />
            </div>
          : null
          }
        </div>
      )
    } else {
      radioOptions = (
        <div className="modal__load">
          <RadioSelector
            name="load-type"
            selected={this.state.loadType}
            change={this.changeRadioType}
            options={options}
          />
        </div>
      )
    }

    switch (props.type) {
      case 'load':
        content = (
          <LoadDrawing
            loadType={this.state.loadType}
            close={props.close}
            open={props.open}
            projects={props.projects}
            project={props.project}
            peerInfo={props.peerInfo}
            dispatch={props.dispatch}
            actions={{
              setProject: props.actions.setProject,
              sendNotification: props.actions.sendNotification
            }}
          />
        );
        break;
      case 'copycss':
        content = (
          <CopyCSS
            frames={props.frames}
            columns={props.columns}
            rows={props.rows}
            cellSize={props.cellSize}
            activeFrameIndex={props.activeFrameIndex}
            animationCode={this.state.previewType !== 'single'}
            duration={props.duration}
          />
        );
        break;
      case 'download':
        content = (
          <DownloadDrawing
            frames={props.frames}
            activeFrame={props.activeFrame}
            columns={props.columns}
            rows={props.rows}
            cellSize={props.cellSize}
            duration={props.duration}
            downloadType={this.state.previewType}
            actions={{ sendNotification: props.actions.sendNotification }}
          />
        );
        break;
      case 'twitter':
        content = (
          <TwitterForm
            maxChars="113"
            frames={props.frames}
            activeFrame={props.activeFrame}
            columns={props.columns}
            rows={props.rows}
            cellSize={props.cellSize}
            duration={props.duration}
            palette={props.palette}
            tweetType={this.state.previewType}
            actions={{
              showSpinner: props.actions.showSpinner,
              sendNotification: props.actions.sendNotification
            }}
          />
        );
        break;
      case 'addCloudPeer':
        content = <AddCloudPeerForm onAdd={this.onAddCloudPeer.bind(this)} />;
        break;
      default:
    }

    return (
      <div className="modal">
        <button className="close" onClick={() => { props.close(); }}>
          Close
        </button>
        {radioOptions}
        {content}
      </div>
    );
  }

  changeRadioType = (value, type) => {
    const newState = {};
    switch (type) {
      case 'load-type':
        newState.loadType = value;
        break;
      default:
        newState.previewType = value;
    }
    this.setState(newState);
  }

  onAddCloudPeer(key) {
    this.props.actions.addCloudPeer(key);
    this.props.close();
  }

  render() {
    const styles = {
      modal: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        border: '4px solid #C5C5C5'
      }
    };

    return (
      <ModalReact
        isOpen={this.props.isOpen}
        onRequestClose={() => { this.props.close(); }}
        style={styles.modal}
        contentLabel={`Dialog ${this.props.type || ''}`}
      >
        {this.getModalContent(this.props)}
      </ModalReact>
    );
  }
}

function generateRadioOptions(props) {
  const project = props.project;

  if (!project) return []
  const frames = project.doc.get('frames');

  if (!frames) return []

  let options;

  if (props.type !== 'load') {
    options = [{
      value: 'single',
      label: 'single',
      id: 3
    }];

    if (frames.size > 1) {
      const spritesheetSupport =
      props.type === 'download' ||
      props.type === 'twitter';

      const animationOption = {
        value: 'animation',
        label: spritesheetSupport ? 'GIF' : 'animation',
        id: 4
      };
      options.push(animationOption);

      if (spritesheetSupport) {
        options.push({
          value: 'spritesheet',
          label: 'spritesheet',
          id: 5
        });
      }
    }
  } else {
    options = [
      { value: 'storage', label: 'Stored', id: 0 },
      { value: 'import', label: 'Import', id: 1 },
      { value: 'export', label: 'Export', id: 2 }
    ];
  }

  return options;
}

const mapStateToProps = (state) => {
  return {
    activeFrameIndex: state.get('activeFrameIndex'),
    project: getProject(state),
    projects: state.projects,
    peerInfo: state.peerInfo,
    duration: state.get('duration')
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch),
  dispatch,
});

const ModalContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Modal);
export default ModalContainer;
