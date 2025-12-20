export class CreateUserDto {
  username: string;
  email: string;
  password: string;
  isBot: boolean; // t: bot, f: client
  //balance: number; Client ko được phép set Balance
}
