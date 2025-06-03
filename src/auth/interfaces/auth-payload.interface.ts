import { User } from '../../users/user.entity';

export interface AuthPayload {
  access_token: string;
  refresh_token: string;
  user: User;
}
