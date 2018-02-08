import React from 'react'
import Preview from './Preview';
import Canvas from './Canvas';
import Button from './Button';
import classnames from 'classnames'
import * as Versions from '../logic/Versions'

export default class Version extends React.Component {
  render() {
    const {isCurrent, isViewing, project, identity, avatar} = this.props

    // const isUpstream = Versions.isUpstream(project, currentProject)
    const color = Versions.color(identity || project)
    const {id} = project

    return (
      <div
        className={classnames("version", {
          "version-selected": isCurrent,
          "version-viewing": isViewing,
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

        <div className="version__avatar" style={{color}}>
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
          { project.isWritable
            ? null
            : "Read-only" }
        </div>

        <div className="version__buttons">
          <Button tiny
            icon="merge"
            disabled={isCurrent}
            onClick={this.mergeProject(id)}
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
    e.stopPropagation()
    this.props.dispatch({type: 'PROJECT_VERSION_DOUBLE_CLICKED', id})
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
