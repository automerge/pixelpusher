export const mapAction = sync => (action, state) => {
  const {identityId} = state

  switch (action.type) {
    case 'OPEN_PROJECT':
      return {
        type: 'OPEN_DOCUMENT',
        id: action.id,
        metadata: {
          type: 'Project',
          identityId
        }
      }

    case 'NEW_PROJECT_CLICKED':
      return {
        type: 'CREATE_DOCUMENT',
        metadata: {
          type: 'Project',
          identityId
        }
      }

    case 'FORK_PROJECT':
      return {
        type: 'FORK_DOCUMENT',
        id: action.id,
        metadata: {
          type: 'Project',
          identityId
        }
      }

    default:
      return action
  }
}
