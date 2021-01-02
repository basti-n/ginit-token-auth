const DELETE_FLAGS = ['d', 'delete'];
const DELETE_GITIGNORE = ['rmgi', 'remove-gitignore'];
const DELETE_TOKEN = ['dt', 'delete-token'];

const hasFlag = (rawFlags, controlFlags) => {
  const flags = Object.keys(rawFlags);
  return !!flags.find((flag) => controlFlags.includes(flag));
};

const hasDeleteFlag = (rawFlags) => hasFlag(rawFlags, DELETE_FLAGS);
const hasGitignoreDeleteFlag = (rawFlags) =>
  hasFlag(rawFlags, DELETE_GITIGNORE);
const hasDeleteTokenFlag = (rawFlags) => hasFlag(rawFlags, DELETE_TOKEN);

module.exports = { hasDeleteFlag, hasGitignoreDeleteFlag, hasDeleteTokenFlag };
