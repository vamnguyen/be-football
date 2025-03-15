import * as fs from 'fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

function getKeysDirectory() {
  const keysDir = path.join(process.cwd(), 'keys');

  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }

  return keysDir;
}

function generateKeyPair(type: 'access_token' | 'refresh_token') {
  const keysDir = getKeysDirectory();
  const privateKeyPath = path.join(keysDir, `${type}_private.key`);
  const publicKeyPath = path.join(keysDir, `${type}_public.key`);

  if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    fs.writeFileSync(privateKeyPath, keyPair.privateKey);
    fs.writeFileSync(publicKeyPath, keyPair.publicKey);
  }

  return {
    privateKey: fs.readFileSync(privateKeyPath, 'utf8'),
    publicKey: fs.readFileSync(publicKeyPath, 'utf8'),
  };
}

export const {
  privateKey: ACCESS_TOKEN_PRIVATE_KEY,
  publicKey: ACCESS_TOKEN_PUBLIC_KEY,
} = generateKeyPair('access_token');

export const {
  privateKey: REFRESH_TOKEN_PRIVATE_KEY,
  publicKey: REFRESH_TOKEN_PUBLIC_KEY,
} = generateKeyPair('refresh_token');
