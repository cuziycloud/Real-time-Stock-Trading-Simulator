import { UserRole } from 'src/users/entities/user.entity';

export interface AuthenticatedUser {
  id: number;
  email: string;
  username: string;
  isBot: boolean;
  role: UserRole;
}
