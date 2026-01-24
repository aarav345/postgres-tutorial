import bcrypt from 'bcrypt';

export class BcryptUtil {
  static async hash(password: string): Promise<string> {
    const rounds = Number(process.env.BCRYPT_ROUNDS ?? 10);
    const salt = await bcrypt.genSalt(rounds);
    return bcrypt.hash(password, salt);
  }


  static async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

