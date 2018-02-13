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
          relativeId: state.projects.getIn([action.id, 'relativeId'])
        }
      }

    default:
      return action
  }
}
