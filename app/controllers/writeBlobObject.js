const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const createShaHash = require("../utils/createShaHash");

/**
 * Create a new SHA-1 hash object.
 * @param {string} type - The type of the output required.
 * @param {string} filepath - The path to the file.
 * @returns {void}
 * @throws {Error} - If type or filepath is not provided.
 * */
function writeBlobObject(type, filepath) {
  
  switch (type) {
    case "-w":
      try {
        const content = fs.readFileSync(filepath, "utf-8");        
        const contentWithHeader = `blob ${content.length}\0${content}`;
        // console.log(contentWithHeader);
        
        const hash = createShaHash(contentWithHeader);
        console.log(hash);

        const compressedData = zlib.deflateSync(contentWithHeader);

        const objectDir = path.join(
          process.cwd(),
          ".git",
          "objects",
          hash.slice(0, 2)
        );
        fs.mkdirSync(objectDir, { recursive: true });
        const objectPath = path.join(objectDir, hash.slice(2));

        fs.writeFileSync(objectPath, compressedData);
      } catch (err) {
        console.error("Error processing file:", err);
      }
      break;

    default:
      console.error("Invalid type provided");
      break;
  }
}

module.exports = writeBlobObject;