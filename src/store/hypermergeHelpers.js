export const mapAction = sync => (action, state) => {
  switch (action.type) {
    case 'NEW_PROJECT_CLICKED':
      return {
        type: 'CREATE_DOCUMENT',
        metadata: {
          type: 'Project'
        }
      }

    default:
      return action
  }
}
