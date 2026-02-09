"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendContact = void 0;
const telegram_1 = require("../utils/telegram");
const sendContact = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        const text = `
📩 <b>New Contact Message</b>

👤 Name: ${name}
📧 Email: ${email}
📱 Phone: ${phone}
💬 Message:
${message}
`;
        await (0, telegram_1.sendTelegramMessage)(text);
        res.status(200).json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
};
exports.sendContact = sendContact;
