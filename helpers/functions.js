const JWT = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const pathResolver = e => {
    return path.resolve(e).split(path.sep).filter(function (e) {
        return e !== "dist";
    }).join("/");
}
const _publickey = fs.readFileSync(pathResolver("public.pem"), "utf8");

module.exports = {
    getArrayDiff: (array1, array2) => {
        return array1.filter(x => !array2.includes(x)).concat(array2.filter(x => !array1.includes(x)));
    },
    verifyToken: (token) => {
        const jwtToken = token.split(/\s+/);
        if (!jwtToken[1]) throw new Error(false);
        return new Promise((r, e) => JWT.verify(
            jwtToken[1],
            _publickey,
            (err, data) => {
                if (err) return e(false);
                else r(data)
            }
        ))
    },
    getSockInfo: (sock) => {
        const info = sock.split("--_")[1].split("_--");
        const peerId = sock.split('--_--')[1]
        return {
            id: info[0],
            channel: info[1],
            peerId
        }
    }

};