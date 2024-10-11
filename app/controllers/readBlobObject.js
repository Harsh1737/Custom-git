const fs = require("fs");
const path = require("path");
const extractContent = require("../utils/extractContentOfCompressedFile.js");
/**
 * @params {string} type - The type of the git object.
 * @params {string} hash - The SHA-1 hash of the git object.
 * @returns {void}
 * */
function readBlobObject( type, hash ) {
  // if (!type || !hash) {
  //   throw new Error("Missing arguments");
  // }
  const dir = hash.substring(0, 2);
  const subdir = hash.substring(2);
  if (type == "-e") {
    try {
      fs.accessSync(
        path.join(process.cwd(), "/.git/objects", `${dir}`,`${subdir}`)
      );
      console.log("Exit Status 0: File exists ! Operation Successful");
      return;
    } catch (e) {
      throw new Error("File does not exist ! Operation Failed");
    }
  }
  const bin_content = fs.readFileSync(
    path.join(process.cwd(), ".git/objects", `${dir}`,`${subdir}`)
  );
  const content =extractContent(bin_content);
//   console.log(content);
  switch (type) {
    case "-t": {
      catFileType(content);
      break;
    }
    case "-s": {
      catFileSize(content);
      break;
    }
    case "-p": {
      catFilePrint(content);
      break;
    }
    default: {
      throw new Error("<type> missing");
    }
  }
}
function catFileType(content) {
  console.log(` Type of the git object is : ${content.type}`);
}
function catFileSize(content) {
  console.log(` Size of the git object is : ${content.size} bytes`);
}
function catFilePrint(content) {
  process.stdout.write(content.content);
}
module.exports = readBlobObject ;