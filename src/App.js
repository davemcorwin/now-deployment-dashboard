import React from 'react';
import { compose, withHandlers, withStateHandlers } from 'recompose';
import Now from 'now-client';
import AliasTree from './AliasTree.js';
import './App.css';

/* Just to make local development easier */
const { REACT_APP_TEAM: TEAM, REACT_APP_TOKEN: TOKEN } = process.env

function App({
  aliases,
  checkedDeployments,
  deployments,
  setCredentialsAndFetchData,
  setTeam,
  setToken,
  team,
  token,
}) {
  return (
    <div>
      <h1>▲now Deploy Dashboard</h1>
      <div className="header">
        <input
          className="header-input"
          name="token"
          onChange={setTeam}
          placeholder="token"
          type="text"
          value={token}
        />
        <input
          className="header-input"
          name="team"
          onChange={setToken}
          placeholder="team"
          type="text"
          value={team}
        />
        <input
          className="header-input-submit"
          type="submit"
          onClick={setCredentialsAndFetchData}
          value="Set Credentials"
        />
      </div>
      {aliases && <AliasTree data={aliases} />}
    </div>

  );
}

export default compose(
  withStateHandlers({
    aliases: null,
    checkedDeployments: [],
    deployments: null,
    now: null,
    team: TEAM,
    token: TOKEN
  }, {
      setAliases: state => aliases => ({
        ...state, aliases
      }),
      setAll: state => (data = {}) => ({
        ...state, ...data
      }),
      setDeployments: state => deployments => ({
        ...state, deployments
      }),
      setTeam: state => event => ({
        ...state, team: event.target.value
      }),
      setToken: state => event => ({
        ...state, token: event.target.value
      }),
    }),
  withHandlers({
    fetchAliases: ({ now, setAliases }) => async () =>
      setAliases(await fetchAliases(now)),
    fetchDeployments: ({ now, setDeployments }) => async () =>
      setDeployments(await fetchDeployments(now)),
    setCredentialsAndFetchData: ({ setAll, team, token }) => async event => {
      event.preventDefault();

      const now = new Now(token, team);

      const [aliases, deployments] = await Promise.all([
        fetchAliases(now),
        fetchDeployments(now)
      ]);

      setAll({
        aliases, deployments, now
      })
    },
  }))(App);

function fetchAliases(now) {
  return now.getAliases();
}

function fetchDeployments(now) {
  return now.getDeployments()
    .then(deployments => groupDeployments(deployments));
}

function groupDeployments(deployments) {
  return deployments.reduce((obj, deployment) => {
    const ds = obj[deployment.name] || [];
    ds.push(deployment);
    obj[deployment.name] = ds;
    return obj;
  }, {})
}


// function deleteDeployments(instance, event) {
//   if (!window.confirm('Are you sure you want to delete these?')) return
//   const { checkedDeployments } = instance.state.checkedDeployments;
//   Promise.all(
//     checkedDeployments.map(uid => this.now.deleteDeployment(uid))
//   ).then(() => {
//     fetchDeployments(instance).then(deployments => instance.setState({ deployments }))
//   })
//     .catch(err => alert(err))
// }

// function handleCheck(instance, event) {
//   const checkedDeployments = instance.state.checkedDeployments.filter(checkedDeployment => checkedDeployment !== event.target.name)
//   if (event.target.checked)
//     checkedDeployments.push(event.target.name)
//   instance.setState({ checkedDeployments })
// }


    /*         
    <p className="App-intro">
      <h3>Aliases</h3>
      <ul>
        {aliases.map(({ alias }) => <li>{alias}</li>)}
      </ul>
    </p>
    <p className="App-intro">
      <h3>
        Deployments
        <button
          onClick={linkEvent(this, deleteDeployments)}
          disabled={checkedDeployments.length === 0}
        >
          Delete
        </button>
      </h3>
      {Object.keys(deployments).map(name =>
        <p>
          <h5>{name}</h5>
          <div className="Deployment">
            {deployments[name].map(({ uid, url }) => {
              const alias = aliases.find(alias => alias.deploymentId === uid)
              return [
                <input
                  type="checkbox"
                  id={uid}
                  name={uid}
                  onChange={linkEvent(this, handleCheck)}
                />,
                <label for={uid}>{url}</label>,
                <strong>{alias && alias.alias}</strong>
              ]
            })}
          </div>
        </p>
      )}
    </p> */