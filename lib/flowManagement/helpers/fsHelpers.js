const fs = require('fs');
const {promisify} = require('util');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
const hjson = require('hjson');
const path = require('path');

module.exports.writeHjsonFile = async function(filePathRoot, filename, object) {
    const hjsonContent = hjson.stringify(object, {sortProps: true});
    const fullFilePath = path.resolve(filePathRoot, encodeURIComponent(filename));
    await writeFile(fullFilePath, hjsonContent);
};

module.exports.readHjsonFile = async function(filePathRoot, filename) {
    const fullFilePath = path.resolve(filePathRoot, filename);
    const fileContents = await readFile(fullFilePath);
    return hjson.parse(fileContents.toString());
};

module.exports.createfolder = async function(filePathRoot, folderName) {
    const fullFolderPath = path.resolve(filePathRoot, encodeURIComponent(folderName));
    await mkdir(fullFolderPath, {
        // When recursive is true,
        // no error will be thrown if the folder already exists
        recursive: true
    });
    return fullFolderPath;
};

module.exports.buildPath = function(filePathRoot, subfolder) {
    return path.resolve(filePathRoot, subfolder);
};

module.exports.lsHjsonFiles = async function(folderName) {
    const allFileNames = await readdir(folderName);
    return allFileNames.filter((fileName) => fileName.endsWith('.hjson'));
};

module.exports.removeOldFiles = async function(fileRoot) {
    await Promise.all([
        rmdir(`${fileRoot}.samples`, {recursive: true}),
        unlink(`${fileRoot}.hjson`),
    ])
};
