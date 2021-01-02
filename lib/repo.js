const CLI = require('clui');
const fs = require('fs');
const git = require('simple-git/promise')();
const touch = require('touch');
const _ = require('lodash');

const auth = require('./authentication');
const inquirer = require('./inquirer');
const { getHashes } = require('crypto');
const { getListofRepoNamesFromRepos } = require('./repo-helper');
const Spinner = CLI.Spinner;

const createRemoteRepo = async () => {
  const githubApi = auth.getInstance();
  const { name, description, visibility } = await inquirer.askRepoQuestions();

  const data = {
    name,
    description,
    private: visibility === 'private',
  };

  const spinner = new Spinner('Creating remote repository...');
  spinner.start();

  try {
    const response = await githubApi.repos.createForAuthenticatedUser(data);
    return response.data.ssh_url;
  } finally {
    spinner.stop();
  }
};

const createGitignore = async () => {
  const filelist = _.without(fs.readdirSync('.'), '.git', '.gitignore');
  if (filelist.length) {
    const { gitignore } = await inquirer.askGitignore(filelist);
    if (gitignore && gitignore.length) {
      return fs.writeFileSync('.gitignore', gitignore.join('\n'));
    }
  }

  return touch('.gitignore');
};

const setupRepo = async (url) => {
  const spinner = new Spinner(
    'Initializing local repo and pushing to remote...'
  );
  spinner.start();

  try {
    await git.init();
    await git.add('.gitignore');
    await git.add('./*');
    await git.commit('Initial commit');
    await git.addRemote('origin', url);
    await git.push('origin', 'master');
  } catch (error) {
    console.log(error.stack);
    throw new Error(error);
  } finally {
    spinner.stop();
  }
};

const getRemoteRepos = async () => {
  const githubApi = auth.getInstance();
  const spinner = new Spinner('Fetching your remote Repos...');
  spinner.start();

  let repos = [];
  try {
    const response = await githubApi.repos.listForAuthenticatedUser({
      visibility: 'all',
    });
    if (response.data) {
      repos = getListofRepoNamesFromRepos(response.data);
    }
  } catch (error) {
    throw Error(error);
  } finally {
    spinner.stop();
    return repos;
  }
};

const deleteRemoteRepos = async (repoNames) => {
  const githubApi = auth.getInstance();
  const spinner = new Spinner('Fetching your remote Repos...');
  spinner.start();

  let deletedRepos = [];
  try {
    const { data } = await auth.getCurrentUser();

    if (data && data.login) {
      deletedRepos = await Promise.all(
        repoNames.map(async (name) =>
          githubApi.repos.delete({
            owner: data.login,
            repo: name,
          })
        )
      );
    }
  } catch (error) {
    throw new Error(error);
  } finally {
    spinner.stop();
    return deletedRepos;
  }
};

module.exports = {
  createRemoteRepo,
  createGitignore,
  setupRepo,
  getRemoteRepos,
  deleteRemoteRepos,
};
