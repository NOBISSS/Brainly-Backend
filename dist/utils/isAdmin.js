"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const admin_1 = require("../constants/admin");
const isAdmin = (user) => {
    return (admin_1.ADMIN_IDS.has(String(user._id)) ||
        admin_1.ADMIN_EMAILS.has(user.email));
};
exports.isAdmin = isAdmin;
