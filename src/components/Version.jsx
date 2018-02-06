import React from 'react'
import Preview from './Preview';
import Button from './Button';
import classnames from 'classnames'
import * as Versions from '../logic/Versions'

export default class Version extends React.Component {
  render() {
    const {isCurrent, isViewing, project} = this.props

    // const isUpstream = Versions.isUpstream(project, currentProject)
    const color = Versions.color(project)
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
        <div className="version__preview" style={{borderColor: color}}>
          { project
            ? <Preview
                animate
                frameIndex={0}
                duration={1}
                project={project.setIn(['doc', 'cellSize'], 3)}
              />
            : null}
        </div>

        <div className="version__main">
          <div className="version__buttons">

            { project.isWritable
            ? null
            : "Read-only" }


            <Button tiny
              icon="merge"
              disabled={isCurrent}
              onClick={this.mergeProject(id)}
              onMouseEnter={this.preview(id)}
              onMouseLeave={this.cancelPreview(id)}
            />

            <Button tiny icon="delete" disabled={isCurrent} onClick={this.deleteProject(id)} />
          </div>
          <div className="version__text">
            {project.id.slice(0, 6)}
          </div>

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
    this.props.dispatch({type: 'DELETE_PROJECT_CLICKED', id})
  }

  mergeProject = id => e => {
    e.stopPropagation()
    this.props.dispatch({type: 'MERGE_PROJECT_CLICKED', id})
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
