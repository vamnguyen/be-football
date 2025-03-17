export interface IAuthToken {
  accessToken: string;
  accessTokenExpiresIn?: number;

  refreshToken?: string;
  refreshTokenExpiresIn?: number;
}
