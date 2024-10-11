const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");

function createShaHash(content) {
  return crypto.createHash("sha1").update(content).digest("hex");
}

async function addTreeToRepo(treeEntries) {
  // Build the content string
  const contentLines = treeEntries.map((entry) => {
    const mode = entry.type === "blob" ? "100644" : "40000"; // Modes: 100644 for blob (file), 40000 for tree (directory)
    return `${mode} ${entry.path}\0${entry.sha}`;
  });

  const content = contentLines.join("") + "\n"; // Join entries without additional newlines between them

  // Create the header
  const contentWithHeader = `tree ${content.length}\0${content}`;

  // Compute SHA-1 hash
  const treeHash = createShaHash(contentWithHeader);

  // Create the object directory and write the compressed content
  const objectDir = path.join(
    process.cwd(),
    `.git/objects/${treeHash.substring(0, 2)}`
  );
  const objectPath = path.join(objectDir, treeHash.substring(2));

  if (!fs.existsSync(objectDir)) {
    fs.mkdirSync(objectDir, { recursive: true });
  }

  const compressedContent = zlib.deflateSync(Buffer.from(contentWithHeader));
  fs.writeFileSync(objectPath, compressedContent);

  console.log(`Added tree ${treeHash}`);
  return treeHash; // Return the hash of the tree object for reference
}

module.exports = addTreeToRepo;
