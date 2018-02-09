import React from 'react'
import Preview from './Preview';
import Canvas from './Canvas';
import Button from './Button';
import classnames from 'classnames'
import * as Versions from '../logic/Versions'

export default class Version extends React.Component {
  render() {
    const {isCurrent, isLive, currentProject, project, identity, avatar} = this.props

    const diffCount = Versions.diffCount(currentProject, project)
    const canMerge = !isCurrent && currentProject.isWritable && diffCount > 0
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
        <div className="version__preview" style={{color}}>
          { project
            ? <Canvas project={project} />
            : null}
        </div>

        <div className="version__avatar">
          { avatar
            ? <Canvas project={avatar} />
            : null}
        </div>

        <div className="version__text">
          { identity
            ? identity.doc.get('name')
            : null }
        </div>

        <div className="version__status">
          { isLive
            ? "Following"
            : project.isWritable
            ? null
            : "Read-only" }
        </div>

        { diffCount > 1
          ? <div className="version__badge">
              {diffCount}
            </div>
          : null }

        <div className="version__buttons">
          <Button tiny
            icon={isLive ? 'pause' : canMerge ? 'forward' : 'play'}
            disabled={isCurrent || !currentProject.isWritable}
            onClick={this.followClicked(id)}
            onMouseEnter={this.preview(id)}
            onMouseLeave={this.cancelPreview(id)}
          />

          <Button tiny icon="delete" disabled={isCurrent} onClick={this.deleteProject(id)} />
        </div>
      </div>
    )
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

  followClicked = id => e => {
    e.stopPropagation()

    const {currentProject, project, isCurrent, isLive} = this.props
    const diffCount = Versions.diffCount(currentProject, project)
    const canMerge = !isCurrent && currentProject.isWritable && diffCount > 0

    if (!isLive && canMerge) {
      const dst = currentProject.id
      this.props.dispatch({type: 'MERGE_DOCUMENT', dst, src: id})
    }

    this.props.dispatch({type: 'FOLLOW_PROJECT_CLICKED', id})
  }

  deleteProject = id => e => {
    e.stopPropagation()
    this.props.dispatch({type: 'DELETE_DOCUMENT', id})
  }

  mergeProject = src => e => {
    const dst = this.props.currentProject.id

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
