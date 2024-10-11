const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");

async function addBlobToRepo(blobContent) {
  const blobSHA = crypto.createHash("sha1").update(blobContent).digest("hex");
  const gitObjectsDir = path.join(process.cwd(), ".git", "objects");
  const blobDir = path.join(gitObjectsDir, blobSHA.slice(0, 2));

  if (!fs.existsSync(blobDir)) {
    fs.mkdirSync(blobDir, { recursive: true });
  }

  const contentWithHeader = `blob ${blobContent.length}\0${blobContent}`;
  const compressedBlob = zlib.deflateSync(contentWithHeader);

  const blobFilePath = path.join(blobDir, blobSHA.slice(2));
  fs.writeFileSync(blobFilePath, compressedBlob);

  console.log(`Added blob ${blobSHA}`);
}

module.exports = addBlobToRepo;