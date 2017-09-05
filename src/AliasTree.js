import React from 'react';
import { lifecycle, withStateHandlers } from 'recompose';
import {
  compose, find, flatMap, has, map, partition, reduce, zipObject
} from 'lodash/fp';

import tree from './tree';

function AliasTree({ aliasTrees, currentAlias, selectAlias, setRef, updateTree }) {
  return (
    <div className="container">
      <div className="alias-select-container">
        <select className="alias-select" onChange={selectAlias}>
          {map(alias =>
            <option key={alias} value={alias}>
              {alias}
            </option>,
            Object.keys(aliasTrees)
          )}
        </select>
      </div>
      <div className="chart-container" ref={setRef} />
    </div>)
}

export default compose(
  withStateHandlers(({ data }) => {
    const aliasTrees = buildAliasTrees(data)
    return {
      aliasTrees,
      currentAlias: Object.keys(aliasTrees)[0]
    }
  }, {
      selectAlias: state => event => {
        if (event.target.value !== state.currentAlias)
          return {
            ...state, currentAlias: event.target.value
          }
      },
      setRef: state => el => ({
        ...state, container: el
      })
    }),
  lifecycle({
    componentDidMount() {
      const { container, aliasTrees, currentAlias } = this.props
      tree.update(container, aliasTrees[currentAlias])
    },
    componentDidUpdate() {
      const { container, aliasTrees, currentAlias } = this.props
      tree.update(container, aliasTrees[currentAlias])
    }
  })
)(AliasTree)

export function buildAliasTrees(aliases) {
  const [rootAliases, simpleAliases] = partition(has('rules'), aliases)
  const zip = zipObject(['name', 'parent', 'type'])

  return {
    ...reduce((acc, rootAlias) => ({
      ...acc,
      [rootAlias.alias]: [
        zip([rootAlias.alias, null, 'root']),
        ...flatMap(rule => [
          zip([rule.pathname || '/*', rootAlias.alias, 'path']),
          zip([rule.dest, rule.pathname || '/*', 'alias']),
          ...recurseAliases(simpleAliases, rule.dest)
        ])(rootAlias.rules)
      ]
    }), {}, rootAliases),
    ...reduce((acc, simpleAlias) => ({
      ...acc,
      [simpleAlias.alias]: [
        zip([simpleAlias.alias, null, 'root']),
        zip([simpleAlias.deployment.url, simpleAlias.alias, 'alias'])
      ]
    }), {}, simpleAliases)
  }
}

/* TODO - check for multiple alias case */
function recurseAliases(simpleAliases, source) {
  const zip = zipObject(['name', 'parent', 'type'])
  const alias = find(simpleAlias => simpleAlias.alias === source, simpleAliases)
  if (!alias) return []
  return [zip([alias.deployment.url, source, 'alias']),
  ...recurseAliases(simpleAliases, alias.deployment.url)
  ]
}