import React from 'react'
import AvatarContainer from './AvatarContainer';
import Canvas from './Canvas';
import Button from './Button';
import Tooltip from './Tooltip';
import classnames from 'classnames'
import * as Versions from '../logic/Versions'

export default class Version extends React.Component {
  state = {
    forkHover: false
  }

  render() {
    const {forkHover} = this.state
    const {isCurrent, mergeDstId, mergeSrcId, project, parent, avatar} = this.props

    if (!project.doc) return null

    const diffCount = parent && parent.doc ? Versions.diffCount(parent, project) : 0
    const canMerge = diffCount > 2 && parent
    const {id, identityIds} = project

    const isMergeDst = mergeDstId === id
    const isMergeSrc = mergeSrcId === id

    return (
      <div
        className={classnames("version", {
          "version-selected": mergeSrcId ? isMergeSrc : isCurrent,
          "version-merge-target": isMergeDst || forkHover,
        })}
        onClick={this.projectClicked(project.id)}
        onDoubleClick={this.projectDoubleClicked(project.id)}
        key={project.id}
      >
        <div className="version__preview">
          { project
            ? <Canvas project={project} />
            : null}
        </div>

        <div className="version__avatars">
          { project.identityIds
            .map(identityId =>
              <AvatarContainer key={identityId} identityId={identityId} />
            )}
        </div>

        <div className="version__text">
          { project.doc.get('title') }
        </div>

        <div className="version__status">
          { isMergeDst
              ? 'Dest'
              : isMergeSrc
              ? 'Source'
              : forkHover
              ? 'Clone'
              : null }
        </div>

        <div className="version__buttons">
          <Button tiny
            icon='merge'
            disabled={!canMerge}
            onClick={this.mergeClicked(id)}
            onMouseEnter={this.preview(id)}
            onMouseLeave={this.cancelPreview(id)}
          />

          <Button tiny
            icon='fork'
            onClick={this.forkClicked(id)}
            onMouseEnter={() => this.setState({forkHover: true})}
            onMouseLeave={() => this.setState({forkHover: false})}
          />
        </div>
      </div>
    )
  }

  forkClicked = id => e => {
    e.stopPropagation()

    const {dispatch} = this.props
    dispatch({type: 'FORK_DOCUMENT', id})
  }

  projectClicked = id => e => {
    e.stopPropagation()
    this.props.dispatch({type: 'PROJECT_VERSION_CLICKED', id})
  }

  projectDoubleClicked = id => e => {
    return // disable for now

    e.stopPropagation()
    this.props.dispatch({type: 'PROJECT_VERSION_DOUBLE_CLICKED', id})
  }

  deleteProject = id => e => {
    e.stopPropagation()
    this.props.dispatch({type: 'DELETE_DOCUMENT', id})
  }

  mergeClicked = src => e => {
    e.stopPropagation()

    const dst = this.props.parent.id
    this.props.dispatch({type: 'MERGE_DOCUMENT', dst, src})
  }

  preview = src => e => {
    e.stopPropagation()

    const dst = this.props.parent.id
    this.props.dispatch({type: 'MERGE_PREVIEW_STARTED', src, dst})
  }

  cancelPreview = id => e => {
    e.stopPropagation()
    this.props.dispatch({type: 'MERGE_PREVIEW_ENDED'})
  }
}
