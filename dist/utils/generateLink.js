"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.random = random;
function random(len) {
    let options = "qwertyuiowqawdw122341213";
    let length = options.length;
    let link = "";
    for (let i = 0; i < len; i++) {
        link += options[Math.floor((Math.random() * length))];
    }
    return link;
}
