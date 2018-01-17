import React from 'react'
import { connect } from 'react-redux';
import {clipboard} from 'electron'

import Field from './Field';

import { shareLinkForProjectId, keyFromShareLink } from '../utils/shareLink';
import { getProjectId } from '../store/reducers/reducerHelpers';

class ShareLink extends React.Component {
  state = {
    shareLink: ""
  }

  componentWillReceiveProps(props) {
    if (props.projectId !== this.props.projectId) {
      this.setState({
        shareLink: shareLinkForProjectId(props.projectId)
      })
    }
  }

  render() {
    const {shareLink} = this.state

    return (
      <div>
        <form onSubmit={this.setShareLink}>
          <Field autoSelect value={shareLink} onChange={this.shareLinkChanged}>
            <Field.Button type="copy" onClick={this.copyClicked} />
          </Field>
        </form>
      </div>
    )
  }

  copyClicked = e => {
    clipboard.writeText(this.state.shareLink)
    this.props.dispatch({type: 'SEND_NOTIFICATION', message: "Share link copied."})
  }

  setShareLink = e => {
    e.preventDefault()
    e.target.elements[0].blur()

    const {shareLink} = this.state
    const id = keyFromShareLink(shareLink)

    this.props.dispatch({type: 'SHARED_PROJECT_ID_ENTERED', id})
  }

  shareLinkChanged = shareLink => {
    this.setState({shareLink})
  }
}

const mapStateToProps = state => ({
  projectId: getProjectId(state.present),
});

const mapDispatchToProps = dispatch => ({
  dispatch,
});

const ShareLinkContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ShareLink);
export default ShareLinkContainer;
