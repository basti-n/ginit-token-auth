const { CONFIG_STORE_NAME, CONFIG_STORE_TOKEN_KEY } = require('./constants');
const { Octokit } = require('@octokit/rest');
const pkgJson = require('../package.json');
const CLI = require('clui');
const inquirer = require('./inquirer');
const Configstore = require('configstore');
const { createTokenAuth } = require('@octokit/auth-token');
const { printErrorAndExit } = require('./error-handler.js');

const store = new Configstore(pkgJson.name || CONFIG_STORE_NAME);
const Spinner = CLI.Spinner;

let octokit;

const getStoredToken = () => store.get(CONFIG_STORE_TOKEN_KEY);
const deleteStoredToken = () => store.delete(CONFIG_STORE_TOKEN_KEY);
const getInstance = () => octokit;
const getCurrentUser = () => getInstance().users.getAuthenticated();
const getGithubToken = async () => {
  let token = await getStoredToken();

  if (!token) {
    token = await getAccessToken();
  }
  githubAuth(token);
  return token;
};
const githubAuth = (token) => {
  octokit = new Octokit({
    auth: token,
  });

  return getInstance();
};
const getAccessToken = async () => {
  const { token } = await inquirer.askGithubCredentials();
  const spinner = new Spinner('Getting Access token from Github...');
  spinner.start();

  try {
    const { token: githubToken } = await createTokenAuth(token)();

    if (!githubToken) {
      printErrorAndExit('Error retrieving your Github Access Token.');
    }

    store.set(CONFIG_STORE_TOKEN_KEY, githubToken);
    return githubToken;
  } catch (error) {
    printErrorAndExit(error.message);
  } finally {
    spinner.stop();
  }
};

module.exports = {
  getStoredToken,
  getInstance,
  getAccessToken,
  githubAuth,
  getGithubToken,
  getCurrentUser,
  deleteStoredToken,
};
