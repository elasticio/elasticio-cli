const fs = require('fs');
const { promisify } = require('util');
const hjson = require('hjson');
const path = require('path');
const expandTilde = require('expand-tilde');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);

module.exports.FsHelper = class FsHelper {
  constructor(filePathRoot) {
    this.filePathRoot = expandTilde(filePathRoot);
  }

  async writeHjsonFile(filename, object) {
    const hjsonContent = hjson.stringify(object, {
      sortProps: true,
    });
    const fullFilePath = path.resolve(this.filePathRoot, filename);
    await writeFile(fullFilePath, hjsonContent);
  }

  async readHjsonFile(filename) {
    const fullFilePath = path.resolve(this.filePathRoot, filename);
    const fileContents = await readFile(fullFilePath);
    return hjson.parse(fileContents.toString());
  }

  async createfolder(subFolderName) {
    const fullFolderPath = this.buildPathForSubFolder(subFolderName);
    await mkdir(fullFolderPath, {
      // When recursive is true,
      // no error will be thrown if the folder already exists
      recursive: true,
    });
  }

  buildPathForSubFolder(subfolder) {
    return path.resolve(this.filePathRoot, subfolder);
  }

  async lsHjsonFiles(pathToRead) {
    const actualPathToRead = pathToRead || this.filePathRoot;
    const allFileNames = await readdir(actualPathToRead);
    return allFileNames.filter((fileName) => fileName.endsWith('.hjson'));
  }

  async removeOldFiles(hjsonFilename) {
    const fileRoot = path.resolve(this.filePathRoot, hjsonFilename.slice(0, '.hjson'.length * -1));
    await Promise.all([
      rmdir(`${fileRoot}.samples`, { recursive: true }),
      unlink(`${fileRoot}.hjson`),
    ]);
  }

  buildPathsForFlowFile(flowName, flowId) {
    const filenameRoot = encodeURIComponent(`${flowName}.${flowId}.flow`);
    const sampleFolderName = `${filenameRoot}.samples`;
    return {
      filenameRoot,
      sampleFolderName,
      flowFileName: `${filenameRoot}.hjson`,
      sampleFolderPath: this.buildPathForSubFolder(sampleFolderName),
    };
  }

  parseFlowFilename(flowFilename) {
    const flowFileParts = flowFilename.split('.');
    const sampleFolderName = `${flowFilename.slice(0, '.hjson'.length * -1)}.samples`;
    return {
      flowId: flowFileParts[flowFileParts.length - 3],
      flowName: decodeURIComponent(flowFileParts.slice(0, -3).join('.')),
      sampleFolderName,
      sampleFolderPath: this.buildPathForSubFolder(sampleFolderName),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  buildPathForSampleFile(sampleFolderPath, stepId) {
    const sampleFileName = `${stepId}.sample.hjson`;
    return {
      sampleFileName,
      sampleFilePath: path.resolve(sampleFolderPath, sampleFileName),
    };
  }
};
