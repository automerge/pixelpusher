import React from 'react'
import { connect } from 'react-redux';
import {clipboard} from 'electron'

import Field from './Field';

import { shareLinkForProjectId, keyFromShareLink, isValidShareLink } from '../utils/shareLink';
import { getProjectId } from '../store/reducers/reducerHelpers';

class ShareLink extends React.Component {
  constructor(props) {
    super();

    const shareLink = props.projectId
      ? shareLinkForProjectId(props.projectId)
      : ""

    this.state = {
      shareLink,
    }
  }

  componentWillReceiveProps(props) {
    if (props.projectId == null) return

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
          <Field
            invalid={shareLink && !isValidShareLink(shareLink)}
            autoSelect
            value={shareLink}
            onBlur={this.resetShareLink}
            onChange={this.shareLinkChanged}>
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

    if (isValidShareLink(shareLink)) {
      const id = keyFromShareLink(shareLink)

      this.props.dispatch({type: 'OPEN_PROJECT', id})
    } else {
      this.props.dispatch({type: 'SEND_NOTIFICATION', message: "Share link is invalid."})
    }
  }

  resetShareLink = () => {
    this.setState({
      shareLink: shareLinkForProjectId(this.props.projectId)
    })
  }

  shareLinkChanged = shareLink => {
    this.setState({shareLink})
  }
}

const mapStateToProps = state => ({
  projectId: getProjectId(state),
});

const mapDispatchToProps = dispatch => ({
  dispatch,
});

const ShareLinkContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ShareLink);
export default ShareLinkContainer;
