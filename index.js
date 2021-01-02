#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const { getGithubToken, deleteStoredToken } = require('./lib/authentication');
const files = require('./lib/files');
const {
  createRemoteRepo,
  createGitignore,
  setupRepo,
  getRemoteRepos,
  deleteRemoteRepos,
} = require('./lib/repo');
const {
  hasDeleteFlag,
  hasGitignoreDeleteFlag,
  hasDeleteTokenFlag,
} = require('./lib/flags');
const { askDeleteRepoQuestions } = require('./lib/inquirer');
const path = require('path');

// Demo

clear();

console.log(
  chalk.yellow(
    figlet.textSync('GINIT CLI TOOL', {
      horizontalLayout: 'full',
      font: 'Banner3',
    })
  )
);

// Init Workflow
const workflow = [];

// Read CLI Arguments
const argv = require('minimist')(process.argv.slice(2));

// Check whether to delete existing token
const shouldDeleteToken = hasDeleteTokenFlag(argv);
if (shouldDeleteToken) {
  workflow.push(deleteStoredToken);
}

// Remove current folder gitignore
const shouldDeleteGitignore = hasGitignoreDeleteFlag(argv);
const deleteGitignore = () => {
  const deletedFile = files.removeFolder('.git', path.resolve(__dirname));
  console.log(chalk.green('Removed .gitgnore', deletedFile));
};
if (shouldDeleteGitignore) {
  workflow.push(deleteGitignore);
}

// Check if Delete
const shouldDeleteRepo = hasDeleteFlag(argv);
const askForDelete = async () => {
  try {
    await getGithubToken();
    const repos = await getRemoteRepos();
    if (repos && repos.length) {
      const { deleteRepos } = await askDeleteRepoQuestions(repos);
      const { status, url } = await deleteRemoteRepos(deleteRepos);
      if (status === 204) {
        console.log(chalk.green(`Deleted ${url}`));
      }
      if (status >= 400) {
        console.log(chalk.red(`Error deleting ${url}`));
      }
    }
  } catch (error) {
    console.log(chalk.red(error.message));
    process.exit();
  } finally {
    return;
  }
};

if (shouldDeleteRepo) {
  workflow.push(askForDelete);
}

// Check if current folder is git folder
const checkIfGitFolder = () => {
  const isGitFolder = files.getFileExists('.git');
  if (isGitFolder) {
    console.log(chalk.red('Current Folder is already GIT Filder'));
    process.exit();
  }
};
workflow.push(checkIfGitFolder);

// Init CLI
const init = async () => {
  await getGithubToken();

  try {
    const url = await createRemoteRepo();
    await createGitignore();
    await setupRepo(url);
    console.log(chalk.green('All done!'));
  } catch (error) {
    if (error.status) {
      switch (error.status) {
        case 401:
          console.log(
            chalk.red(
              "Couldn't log you in. Please provide correct credentials/token."
            )
          );
          break;
        case 422:
          console.log(
            chalk.red(
              'There is already a remote repository or token with the same name'
            )
          );
          break;
        default:
          console.log(chalk.red(error));
      }
    } else {
      console.log(chalk.red(error, error.stack));
    }
  }
};

workflow.push(init);

// Start Workflow
workflow.forEach((wf) => wf());
