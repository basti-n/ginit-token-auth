const fs = require('fs');
const path = require('path');
const del = require('del');

const getCurrentWorkingDirectory = () => path.basename(process.cwd());
const getFileExists = (filePath) => fs.existsSync(filePath);
const readDirectory = (dir = getCurrentWorkingDirectory()) =>
  fs.readdirSync(dir);
const createPath = (fileName, basePath) => path.join(basePath, fileName);
const removeFolder = (fileName, path = getCurrentWorkingDirectoryPath()) =>
  del.sync([createPath(fileName, path)]);

module.exports = {
  getCurrentWorkingDirectory,
  getFileExists,
  removeFolder,
  readDirectory,
  createPath,
};
