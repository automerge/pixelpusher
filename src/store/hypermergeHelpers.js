import shortid from 'shortid'

export const mapAction = sync => (action, state) => {
  const {identityId} = state

  switch (action.type) {
    case 'NEW_PROJECT_CLICKED':
      return {
        type: 'CREATE_DOCUMENT',
        metadata: {
          type: 'Project',
          identityId,
          relativeId: shortid.generate()
        }
      }

    case 'FORK_PROJECT':
      return {
        type: 'FORK_DOCUMENT',
        id: action.id,
        metadata: {
          type: 'Project',
          identityId,
          sourceId: action.id,
          versionId: shortid.generate(),
          relativeId: state.projects.getIn([action.id, 'relativeId'])
        }
      }

    case 'CLONE_PROJECT': {
      const {id, versionId, relativeId} = state.projects.get(action.id)

      return {
        type: 'FORK_DOCUMENT',
        id: id,
        metadata: {
          type: 'Project',
          identityId,
          sourceId: id,
          versionId,
          relativeId
        }
      }
    }

    default:
      return action
  }
}
