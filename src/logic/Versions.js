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
  const relativeId = current.relativeId
  const relatives = projects
    .filter(project => project.relativeId === relativeId)
  return sort(relatives.toList())
}

export const relatedWithHistory = (current, projects) => {
  const parents = related(current, projects)
    .flatMap(project =>
      List.of(commonAncestor(current, project), List.of(project)))

  return parents
}

export const diffCount = (proj, other) =>
  clock(other).reduce((sum, seq, k) =>
    sum + Math.max(0, seq - getSeq(proj, k)),
  0)

export const equals = (a, b) =>
  clock(a).equals(clock(b))

export const sort = projects =>
  projects.sort(comparator)

export const isUpstream = (project, other) =>
  Clock.lessOrEqual(clock(project), clock(other))

export const comparator = (a, b) =>
  compareBoolean(b.isWritable, a.isWritable) ||
    a.id.localeCompare(b.id)

export const getSeq = (doc, actor) =>
  clock(doc).get(actor, 0)

export const clock = project =>
  project.doc._state.getIn(['opSet', 'clock'])

export const commonClock = (doc, other) =>
  Clock.common(clock(doc), clock(other))

export const commonAncestor = (base, other) => {
  const commonClock = Clock.common(clock(base), clock(other))
  if (commonClock.equals(clock(base))) return base
  const changes = changesUntil(base, commonClock)
  return Automerge.applyChanges(Automerge.initImmutable(), changes)
}

export const getHistory = doc => {
  const history = doc._state.getIn(['opSet', 'history'])
  return history.map((change, index) => {
    return {
      change,
      get snapshot () {
        const root = Automerge.initImmutable(doc._state.get('actorId'))
        return Automerge.applyChanges(root, history.slice(0, index + 1), false)
      }
    }
  })
}

export const history = doc =>
  doc._state.getIn(['opSet', 'history'])

export const changesUntil = (doc, clock) =>
  history(doc)
  .filter(ch =>
    ch.get('seq') <= clock.get(ch.get('actor'), 0))

export const color = identity =>
  identity.getIn(['doc', 'color']) || '#' + identity.id.slice(0, 6)

export const compareBoolean = (a, b) =>
  a - b
