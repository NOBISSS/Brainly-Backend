import { ADMIN_EMAILS, ADMIN_IDS } from "../constants/admin";


export const isAdmin = (user: any) => {
  return (
    ADMIN_IDS.has(String(user._id)) ||
    ADMIN_EMAILS.has(user.email)
  );
};
