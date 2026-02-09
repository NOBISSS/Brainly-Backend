import { Request, Response } from "express"
import { sendTelegramMessage } from "../utils/telegram"

export const sendContact = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message } = req.body

    const text = `
📩 <b>New Contact Message</b>

👤 Name: ${name}
📧 Email: ${email}
📱 Phone: ${phone}
💬 Message:
${message}
`

    await sendTelegramMessage(text)

    res.status(200).json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false })
  }
}
