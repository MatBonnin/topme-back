// src/auth/dto/facebook-login.dto.ts

import { IsString } from 'class-validator';

export class FacebookLoginDto {
  @IsString()
  accessToken: string;
}
