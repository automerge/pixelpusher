import React from 'react';
import Preview from './Preview';
import Button from './Button';
import {
  generateExportString, exportedStringToProject
} from '../utils/storage';

import Project from '../records/Project'
import { keyFromShareLink } from '../utils/shareLink';

export default class LoadDrawing extends React.Component {
  getExportCode() {
    return generateExportString(this.props.project);
  }

  importProject() {
    const project = exportedStringToProject(this.importProjectData.value);

    if (project) {
      this.props.actions.setProject(project);
      this.props.close();
      this.props.actions.sendNotification('Project successfully imported');
    } else {
      this.props.actions.sendNotification("Sorry, the project couldn't be imported");
    }
  }

  deleteProject(id, e) {
    e.stopPropagation();

    this.props.dispatch({type: 'DELETE_DOCUMENT', id});
  }

  newProjectClicked = e => {
    this.props.dispatch({type: 'NEW_PROJECT_CLICKED'});
    this.props.close();
  }

  projectClick(id) {
    this.props.actions.setProject(id);
    this.props.close();
  }

  giveMeProjects() {
    const {identity} = this.props;
    const avatarId = identity.doc.get('avatarId')
    const projectGroups = this.props.projects.valueSeq()
      .filter(p => p.relativeId)
      .groupBy(p => p.relativeId);

    return projectGroups.map(group => {
      const project = group.find(p => p.doc && p.isWritable) || group.first()
      const {id, doc} = project

      if (!doc) return null

      return (
        <div
          key={id}
          onClick={() => { this.projectClick(id); }}
          className="load-drawing__drawing"
        >
          <Preview
            animate
            key={id}
            project={project}
            frameIndex={0}
            duration={1}
          />
          <div className="load-drawing__buttons">
            <Button
              small
              icon="delete"
              onClick={(event) => { this.deleteProject(id, event); }}
            />
            { avatarId === id
              ? null
              : <Button small icon="avatar" onClick={this.setAvatar(id)} />
            }
          </div>
          <h2>{doc.get('title')}</h2>
        </div>
      );
    }).valueSeq();
  }

  giveMeOptions(type) {
    switch (type) {
      case 'import': {
        return (
          <div className="load-drawing">
            <h2>Paste a previously exported code</h2>
            <textarea
              className="load-drawing__import"
              ref={(c) => { this.importProjectData = c; }}
              defaultValue={''}
            />
            <button
              className="import__button"
              onClick={() => { this.importProject(); }}
            >
              Import
            </button>
          </div>
        );
      }

      case 'export': {
        return (
          <div className="load-drawing">
            <h2>Select and copy the following code. Keep it save in a text file</h2>
            <pre className="load-drawing__export">
              {`\n${this.getExportCode()}\n\n`}
            </pre>
          </div>
        );
      }

      default:
      case 'load': {
        const drawings = this.giveMeProjects();
        const drawingsStored = drawings.size > 0;
        return (
          <div className="load-drawing">
            <h2>Select one of your awesome drawings</h2>
            <div
              className={
                `load-drawing__container
                ${!drawingsStored ? 'empty' : ''}`}
            >
              <div
                onClick={this.newProjectClicked}
                className="load-drawing__drawing new"
              >
                <h1>+</h1>
                Create new project
              </div>
              {drawingsStored ? drawings : 'Nothing awesome yet...'}
              <div className="load-drawing__spacer" />
              <div className="load-drawing__spacer" />
              <div className="load-drawing__spacer" />
            </div>
          </div>
        );
      }
    }
  }

  render() {
    return (this.giveMeOptions(this.props.loadType));
  }

  setAvatar = id => e => {
    e.preventDefault();
    e.stopPropagation();
    this.props.dispatch({type: 'AVATAR_BUTTON_CLICKED', id})
  }
}
