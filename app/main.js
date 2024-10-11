const createGitDirectory = require("./controllers/createGitDirectory");
const readBlobObject = require("./controllers/readBlobObject.js");
const writeBlobObject = require("./controllers/writeBlobObject.js");
const lsTree = require("./controllers/listTreeContent");
const writeTree = require("./controllers/writeTreeObject.js");
const commitTree = require("./controllers/commitTreeObject.js");
const cloneRemoteRepository = require("./controllers/cloneRemoteRepository.js");
const command = process.argv[2];

switch (command) {
  case "init":
    createGitDirectory();
    break;
  case "cat-file":
    const type = process.argv[3];
    const hash = process.argv[4];

    readBlobObject(type, hash);
    break;

  case "hash-object": {
    const type = process.argv[3];
    const filepath = process.argv[4];
    writeBlobObject(type, filepath);
    break;
  }

  case "ls-tree": {
    const hash = process.argv[4];
    lsTree(hash);
    break;
  }

  case "write-tree": {
    const directory = process.cwd();
    writeTree(directory);
    break;
  }

  case "commit-tree": {
    const tree_sha = process.argv[3];
    const parent_commit_sha = process.argv[5];
    const message = process.argv[7];
    commitTree(tree_sha, parent_commit_sha, message);
    break;
  }
  case "clone":{
    const url = process.argv[3];
    cloneRemoteRepository(url);
    break
  }
  default:
    throw new Error(`Unknown command ${command}`);
}
