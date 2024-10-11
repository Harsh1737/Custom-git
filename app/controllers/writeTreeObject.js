const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");

function hashFile(filePath) {
  const content = fs.readFileSync(filePath);
  const header = `blob ${content.length}\0`;
  const store = Buffer.concat([Buffer.from(header), content]);

  const hash = crypto.createHash("sha1").update(store).digest("hex");
  const objectDir = path.join(
    process.cwd(),
    `.git/objects/${hash.substring(0, 2)}`
  );
  const objectFilePath = path.join(objectDir, `${hash.substring(2)}`);

  if (!fs.existsSync(objectDir)) {
    fs.mkdirSync(objectDir, { recursive: true });
  }

  const compressedContent = zlib.deflateSync(store);
  fs.writeFileSync(objectFilePath, compressedContent);

  return Buffer.from(hash, "hex"); // Return the binary hash (20 bytes)
}

// Recursive function to write the tree object
function writeTreeHelper(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  let contentBuffers = [];

  entries.forEach((entry) => {
    const fullpath = path.join(directory, entry.name);
    if (entry.name === ".git") return;

    let mode, hash;
    if (entry.isDirectory()) {
      mode = "40000"; // Directory mode //had to remove leading zeros coz git ignores leading zeros
      hash = writeTreeHelper(fullpath); // Recurse into subdirectory
    } else if (entry.isFile()) {
      mode = "100644"; // Regular file mode
      hash = hashFile(fullpath); // Hash the file and return its binary SHA-1 hash
    }

    // Append the mode, filename, null byte, and the binary SHA-1 hash
    const entryContent = Buffer.concat([
      Buffer.from(`${mode} ${entry.name}\0`, "utf-8"), // Mode and filename followed by null byte
      hash, // Binary SHA-1 hash
    ]);
    contentBuffers.push(entryContent);
  });

  // Concatenate all tree entries into a single buffer
  const content = Buffer.concat(contentBuffers);
  const header = Buffer.from(`tree ${content.length}\0`);
  const treeObject = Buffer.concat([header, content]);

  // Compute SHA-1 hash of the tree object
  const treeHash = crypto.createHash("sha1").update(treeObject).digest("hex");
  const objectDir = path.join(
    process.cwd(),
    `.git/objects/${treeHash.substring(0, 2)}`
  );
  const objectFilePath = path.join(objectDir, `${treeHash.substring(2)}`);

  // Store the tree object in the Git object store
  if (!fs.existsSync(objectDir)) {
    fs.mkdirSync(objectDir, { recursive: true });
  }

  const compressedContent = zlib.deflateSync(treeObject);
  fs.writeFileSync(objectFilePath, compressedContent);

  return Buffer.from(treeHash, "hex"); // Return the binary hash of the tree object
}

// Entry point for writing the tree
const writeTree = (directory) => {
  const treeHash = writeTreeHelper(directory);
  console.log(treeHash.toString("hex")); // Output the hash in hexadecimal form
};
module.exports = writeTree;