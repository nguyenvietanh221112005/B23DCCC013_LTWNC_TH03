// Dùng: npm run hash -- <mật-khẩu>  → in ra bcrypt hash để dán vào data/users.json
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Cách dùng: npm run hash -- <mật-khẩu>");
  process.exit(1);
}
console.log(bcrypt.hashSync(password, 10));
