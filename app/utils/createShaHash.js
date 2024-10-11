const crypto = require("crypto");
function createShaHash(data){
    return crypto.createHash("sha1").update(data).digest("hex");
}

module.exports = createShaHash;