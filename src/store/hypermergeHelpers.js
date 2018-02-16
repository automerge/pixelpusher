export const mapAction = sync => (action, state) => {
  switch (action.type) {
    case 'OPEN_PROJECT':
      return {
        type: 'OPEN_DOCUMENT',
        id: action.id
      }

    case 'NEW_PROJECT_CLICKED':
      return {
        type: 'CREATE_DOCUMENT',
        metadata: {
          type: 'Project'
        }
      }

    case 'FORK_PROJECT':
      return {
        type: 'FORK_DOCUMENT',
        id: action.id
      }

    default:
      return action
  }
}
