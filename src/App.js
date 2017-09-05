import React from 'react';
import Now from 'now-client';
import { compose, withHandlers, withStateHandlers } from 'recompose';
import { get, find, keys, map } from 'lodash/fp';
import AliasTree from './AliasTree.js';
import './App.css';

/* Just to make local development easier */
const { REACT_APP_TEAM: TEAM, REACT_APP_TOKEN: TOKEN } = process.env

function App({
  aliases,
  checkedDeployments,
  deployments,
  navigate,
  page,
  setCredentialsAndFetchData,
  setTeam,
  setToken,
  team,
  token,
}) {
  console.log(deployments)
  console.log(aliases)
  return (
    <div>
      <header>
        <a href="#" className="logo">▲now Deploy Dashboard</a>
      </header>

      {/* Header Form */}
      <form className="header-form">
        <div className="row">
          <div className="col-sm-12 col-md-5">
            <input
              className="full-width"
              name="token"
              onChange={setTeam}
              placeholder="token"
              type="text"
              value={token}
            />
          </div>
          <div className="col-sm-12 col-md-5">
            <input
              className="full-width"
              name="team"
              onChange={setToken}
              placeholder="team"
              type="text"
              value={team}
            />
          </div>
          <div className="col-sm-12 col-md-2">
            <input
              className="primary"
              type="submit"
              onClick={setCredentialsAndFetchData}
              value="Set Credentials"
            />
          </div>
        </div>
      </form>

      {deployments && aliases &&

        <div className="responsive-margin">
          <header className="tab-links">
            <a
              href="#"
              onClick={() => navigate('deployments')}
              className={`button ${page === 'deployments' ? 'active' : ''}`}
            >
              Deployments
            </a>
            <a href="#" onClick={() => navigate('aliases')} className={`button ${page === 'aliases' ? 'active' : ''}`}>Aliases</a>
          </header>
          {/* Tab Content */}
          <div className="tab-content">
            <div className={page === 'aliases' ? '' : 'hidden'}>
              <AliasTree data={aliases} />
            </div>
            <div className={page === 'deployments' ? '' : 'hidden'}>
              <table className="deployment-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Url</th>
                    <th>State</th>
                    <th>Alias</th>
                  </tr>
                </thead>

                {map(name =>
                  <tbody key={name}>
                    <tr>
                      <td colSpan="4">
                        <div className="input-group">
                          <input type="checkbox" id={name} />
                          <label htmlFor={name}></label>
                        </div>
                        {name}
                      </td>
                    </tr>
                    {map(deployment => {
                      const alias = get('alias', find(alias => alias.deploymentId === deployment.uid, aliases))

                      return (
                        <tr key={deployment.uid}>
                          <td></td>
                          <td>
                            <div className="input-group">
                              <input type="checkbox" id={deployment.uid} />
                              <label htmlFor={deployment.uid}></label>
                            </div>
                            {deployment.url}
                          </td>
                          <td>{deployment.state}</td>
                          <td>
                            {alias}
                          </td>
                        </tr>
                      )
                    }
                      , deployments[name]
                    )}
                  </tbody>
                  , keys(deployments)
                )}
              </table>
            </div>
          </div>
        </div>
      }
    </div>
  );
}

export default compose(
  withStateHandlers({
    aliases: null,
    checkedDeployments: [],
    deployments: null,
    now: null,
    page: 'deployments',
    team: TEAM,
    token: TOKEN
  }, {
      navigate: state => page => ({
        ...state, page
      }),
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