export const related = (relativeId, projects) =>
  sort(projects
    .filter(project => project.get('relativeId') === relativeId))

export const sort = projects =>
  projects.sortBy(project => project._actorId)

export const color = project =>
  "#" + project._actorId.slice(0, 6)

export const clock = project =>
  project._state.getIn(['opSet', 'clock'])

export const isUpstream = (project, other) =>
  clockLessOrEqual(clock(project), clock(other))

function clockLessOrEqual(clock1, clock2) {
  return clock1.keySeq().concat(clock2.keySeq()).reduce(
    (result, key) => (result && clock1.get(key, 0) <= clock2.get(key, 0)),
    true)
}
