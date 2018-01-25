export const related = (relativeId, projects) =>
  sort(projects
    .filter(project => project.get('relativeId') === relativeId))

export const sort = projects =>
  projects.sortBy(project => project._actorId)

export const color = project =>
  "#" + project._actorId.slice(0, 6)

export const clock = project =>
  project._state.getIn(['opSet', 'clock'])
