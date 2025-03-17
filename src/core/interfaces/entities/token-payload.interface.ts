export interface ITokenPayload {
  id: string;
  email: string;
  type: 'access' | 'refresh';
}
