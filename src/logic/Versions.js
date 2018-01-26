export const related = (relativeId, projects) =>
  sort(projects
    .filter(project => project.get('relativeId') === relativeId))

export const sort = projects =>
  projects.sort(compareClocks)

export const color = project =>
  "#" + project._actorId.slice(0, 6)

export const clock = project =>
  project._state.getIn(['opSet', 'clock'])

export const isUpstream = (project, other) =>
  clockLessOrEqual(clock(project), clock(other))

export const comparator = (a, b) =>
  compareClocks(clock(a), clock(b))

export const compareClocks = (a, b) => {
  if (a.equals(b)) return 0
  if (isUpstream(a, b)) return -1
  return a._actorId.localeCompare(b._actorId)
}

export const clockLessOrEqual = (clock1, clock2) =>
  clock1.keySeq().concat(clock2.keySeq())
  .reduce((result, key) =>
    (result && clock1.get(key, 0) <= clock2.get(key, 0)),
    true)


