import React from 'react'
import Preview from './Preview';
import Canvas from './Canvas';
import Button from './Button';
import Tooltip from './Tooltip';
import classnames from 'classnames'
import * as Versions from '../logic/Versions'

export default class Version extends React.Component {
  render() {
    const {isCurrent, isLive, project, parent, identity, avatar} = this.props

    if (!project.doc) return null

    const diffCount = parent && parent.doc ? Versions.diffCount(parent, project) : 0
    const canMerge = diffCount > 0 && parent
    const color = Versions.color(identity || project)
    const {id} = project

    return (
      <div
        className={classnames("version", {
          "version-selected": isCurrent,
          "version-following": isLive,
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
          <div className="version__avatar" style={{color}}>
            { avatar
              ? <Canvas project={avatar} />
              : null}
          </div>
        </div>

        <div className="version__text">
          { project.doc.get('title') }
        </div>

        <div className="version__status">
          { isCurrent
            ? 'Current'
            : null }
        </div>

        { diffCount > 1
          ? <div className="version__badge">
              {"\u00a0•\u00a0"}
            </div>
          : null }

        <div className="version__buttons">
          <Button tiny
            icon='merge'
            disabled={!canMerge}
            onClick={this.mergeClicked(id)}
          />

          <Button tiny
            icon='fork'
            onClick={this.forkClicked(id)}
          />

          <Button tiny icon="delete" onClick={this.deleteProject(id)} />
        </div>
      </div>
    )
  }

  forkClicked = id => e => {
    e.stopPropagation()

    const {dispatch} = this.props
    dispatch({type: 'FORK_PROJECT', id})
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
    const dst = this.props.parent.id

    e.stopPropagation()
    this.props.dispatch({type: 'MERGE_DOCUMENT', dst, src})
  }

  preview = id => e => {
    e.stopPropagation()
    this.props.dispatch({type: 'MERGE_PREVIEW_STARTED', id})
  }

  cancelPreview = id => e => {
    e.stopPropagation()
    this.props.dispatch({type: 'MERGE_PREVIEW_ENDED', id})
  }
}
