const inquirer = require('inquirer');
const files = require('./files');
const { required } = require('./validators');

const credentialQuestions = [
  {
    name: 'username',
    type: 'input',
    message: 'Enter your GitHub username or e-mail address:',
    validate: required,
  },
  {
    name: 'token',
    type: 'password',
    message: 'Enter your GitHub personal access token:',
    validate: required,
  },
];

const askGithubCredentials = () => inquirer.prompt(credentialQuestions);

const askRepoQuestions = () => {
  const argv = require('minimist')(process.argv.slice(2));

  const repoQuestions = [
    {
      type: 'input',
      name: 'name',
      message: 'Enter a name for the repository',
      default: argv._[0] || files.getCurrentWorkingDirectory(),
      validate: (value) =>
        required(value, 'Please provide a value for the repo name:'),
    },
    {
      type: 'input',
      name: 'description',
      message: 'Enter a description for the repository (optional):',
      default: argv._[1] || null,
    },
    {
      type: 'list',
      name: 'visibility',
      message: 'Public or private (default: public)',
      choices: ['public', 'private'],
      default: 'public',
    },
  ];
  return inquirer.prompt(repoQuestions);
};

const askGitignore = (filelist) => {
  const gitignoreQuestions = [
    {
      name: 'gitignore',
      type: 'checkbox',
      choices: filelist,
      default: ['node_modules'],
    },
  ];

  return inquirer.prompt(gitignoreQuestions);
};

const askDeleteRepoQuestions = (repos) => {
  const reposToDeleteQuestion = [
    {
      name: 'deleteRepos',
      type: 'checkbox',
      choices: repos,
    },
  ];

  return inquirer.prompt(reposToDeleteQuestion);
};

module.exports = {
  askGithubCredentials,
  askRepoQuestions,
  askGitignore,
  askDeleteRepoQuestions,
};
