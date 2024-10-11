const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const createShaHash = require("../utils/createShaHash");

/**
 * Create a new SHA-1 hash object.
 * @param {string} tree_sha - The tree sha.
 * @param {string} parent_commit_sha - The parent commit sha.
 * @param {string} message - The commit message.
 * @returns {void}
 * */
function commitTree(treeSHA, parentCommitSHAs, message, author, timestamp) {
  const content = [
    `tree ${treeSHA}`,
    ...parentCommitSHAs.map((sha) => `parent ${sha}`),
    `author ${author} ${timestamp} -0700`,
    `committer ${author} ${timestamp} -0700`,
    "",
    message
  ].join("\n");
  const contentWithHeader = `commit ${content.length}\0${content}`;

  const commitHash = createShaHash(contentWithHeader);

  const objectDir = path.join(
    process.cwd(),
    `.git/objects/${commitHash.substring(0, 2)}`
  );
  const objectFilePath = path.join(objectDir, commitHash.substring(2));
  if (!fs.existsSync(objectDir)) {
    fs.mkdirSync(objectDir, { recursive: true });
  }

  const compressedContent = zlib.deflateSync(contentWithHeader);
  fs.writeFileSync(objectFilePath, compressedContent);
  console.log(`Commit Hash: ${commitHash}`);
}
module.exports = commitTree;
