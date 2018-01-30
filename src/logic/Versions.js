import Automerge from 'automerge'
import * as Clock from './Clock'
import { List } from 'immutable'

export const relatedTree = (current, projects) => {
  const relatives = related(current, projects)
  const past = relatives.takeUntil(p => p === current)
  const future = relatives.skipUntil(p => p === current).skip(1)

  return List.of(past, current, future)
}

export const related = (current, projects) => {
  const relativeId = current.get('relativeId')
  const relatives = projects
    .filter(project => project.get('relativeId') === relativeId)
  return sort(relatives.toList())
}

export const relatedWithHistory = (current, projects) => {
  const parents = related(current, projects)
    .flatMap(project =>
      List.of(commonAncestor(current, project), List.of(project)))

  return parents
}

export const equals = (a, b) =>
  clock(a).equals(clock(b))

export const sort = projects =>
  projects.sort(comparator)

export const isUpstream = (project, other) =>
  Clock.lessOrEqual(clock(project), clock(other))

export const comparator = (a, b) =>
  Clock.comparator(clock(a), clock(b))

export const getSeq = (doc, actor) =>
  clock(doc).get(actor, 0)

export const clock = project =>
  project._state.getIn(['opSet', 'clock'])

export const commonAncestor = (base, other) => {
  const commonClock = Clock.common(clock(base), clock(other))
  if (commonClock.equals(clock(base))) return base
  const changes = changesUntil(base, commonClock)
  return Automerge.applyChanges(Automerge.initImmutable(), changes)
}

export const changesUntil = (doc, clock) =>
  doc._state
  .getIn(['opSet', 'history'])
  .filter(ch =>
    ch.get('seq') <= clock.get(ch.get('actor'), 0))

export const color = project =>
  '#' + project._actorId.slice(0, 6)
