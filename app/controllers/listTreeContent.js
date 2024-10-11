const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
/**
 * Read the object from the .git directory.
 * @param {string} sha - The SHA-1 hash of the object.
 * @returns {Buffer} - The decompressed object data.
 */
function readObject(sha) {
  const objectDir = path.join(".git", "objects", sha.slice(0, 2));
  const objectFile = path.join(objectDir, sha.slice(2));

  const compressedData = fs.readFileSync(objectFile);
  return zlib.inflateSync(compressedData);
}
/**
 * Parse the tree data.
 * @param {Buffer} treeData - The tree data to parse. 
 * @returns {Array} - The parsed tree entries.
 */
function parseTree(treeData) {
  let headerEnd = treeData.indexOf(0);
  const rest = treeData.slice(headerEnd + 1);

  let entries = [];
  let offset = 0;

  while (offset < rest.length) {
    const modeEnd = rest.indexOf(32, offset); // Find the next space character
    const mode = rest.slice(offset, modeEnd).toString();

    // Extract the name (up to the null byte)
    const nameEnd = rest.indexOf(0, modeEnd + 1);
    const name = rest.slice(modeEnd + 1, nameEnd).toString();

    // Extract the 20-byte SHA-1 hash following the null byte
    const sha = rest.slice(nameEnd + 1, nameEnd + 21).toString("hex"); // Convert to hex for readability

    entries.push({ mode, name, sha });
    if (offset + 21 > rest.length) break;
    offset = nameEnd + 21; // Move to the next entry
  }
  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Implementation of ls-tree command.
 * @param {string} sha - The tree SHA to inspect.
 * @param {boolean} nameOnly - Whether to display only names.
 */
function lsTree (sha) {
  // console.log("sha");
  const treeData = readObject(sha); // Get the decompressed tree data
  const entries = parseTree(treeData); // Parse the tree entries
  // Full output (mode, type, SHA, name)
  if ("--name-only" === process.argv[3]) {
    entries.forEach((entry) => {
      console.log(`${entry.name}`);
    });
  } else {
    entries.forEach((entry) => {
      const type = entry.mode === "040000" ? "tree" : "blob";
      process.stdout.write(`${entry.mode} ${type} ${entry.sha} ${entry.name}`);
    });
}
};

module.exports = lsTree;