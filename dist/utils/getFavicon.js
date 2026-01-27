"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavicon = getFavicon;
function getFavicon(url) {
    try {
        const { hostname } = new URL(url);
        return `https://www.google.com/s2/favicons?sz=256&domain=${hostname}`;
    }
    catch {
        return null;
    }
}
