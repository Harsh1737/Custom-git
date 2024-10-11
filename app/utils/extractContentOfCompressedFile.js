const zlib = require("zlib");

/**
    * Extracts the content from the compressed binary data.
    * @params {Buffer} compressed_binary_data - The compressed binary data.
    * @returns {Object} - The extracted content.
* */

function extractContent(compressed_binary_data){
    // console.log(compressed_binary_data);
    // console.log(compressed_binary_data.toString('utf-8'));
    // console.log(decompressed_binary_data);
    // console.log(compressed_binary_data);
    // console.log(compressed_binary_data.toString('hex'));
    const decompressed_binary_data = zlib.inflateSync(compressed_binary_data);
    const total_content = decompressed_binary_data.toString('utf-8');
    
    const splitIndex = total_content.indexOf('\0');
    // console.log(splitIndex);
    if (splitIndex !== -1) {
        metadata = total_content.slice(0, splitIndex);
        content = total_content.slice(splitIndex+1);
    } else {
        metadata = total_content;
        content = "";
    }

    const typeOfObject = metadata.split(' ')[0];
    const sizeOfObject = metadata.split(' ')[1];
    return { type: typeOfObject, size: sizeOfObject, content: content };
}

module.exports = extractContent;