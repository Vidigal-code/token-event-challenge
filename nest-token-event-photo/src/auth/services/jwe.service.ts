import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { pbkdf2 } from 'crypto';
import { promisify } from 'util';

/** Promisified version of the pbkdf2 function for async/await usage */
const pbkdf2Async = promisify(pbkdf2);

/**
 * JweService handles encryption and decryption of JWTs using JWE (JSON Web Encryption).
 * It uses a symmetric key derived from a configured secret.
 */
@Injectable()
export class JweService {
  /** Promise that resolves to the derived secret key used for encryption/decryption */
  private secretKeyPromise: Promise<Uint8Array>;

  /**
   * Constructor that initializes the secret key using PBKDF2.
   * @param configService - Injected configuration service to access environment variables
   */
  constructor(private configService: ConfigService) {
    this.secretKeyPromise = pbkdf2Async(
      this.configService.get<string>('JWE_SECRET'), // Secret passphrase from config
      'salt', // Static salt value
      100000, // Iteration count
      32, // Key length in bytes (256 bits)
      'sha256' // Hashing algorithm
    );
  }

  /**
   * Encrypts a given payload into a JWE token.
   * @param payload - The string payload to be encrypted
   * @returns A Promise that resolves to the encrypted JWE token string
   */
  async encrypt(payload: string): Promise<string> {
    const jose = await import('jose'); // Dynamic import to reduce startup time
    const secretKey = await this.secretKeyPromise;
    const refreshTokenExpiresIn = this.configService.get<number>(
      'REFRESH_TOKEN_EXPIRES_IN_MS',
      7 * 24 * 60 * 60 * 1000 // Default to 7 days in milliseconds
    );

    return new jose.EncryptJWT({ data: payload })
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' }) // Direct encryption with AES-256-GCM
      .setIssuedAt() // Set current time as 'iat' claim
      .setExpirationTime(Math.floor(refreshTokenExpiresIn / 1000)) // Expiration in seconds
      .encrypt(secretKey); // Encrypt with the derived key
  }

  /**
   * Decrypts a given JWE token and retrieves the original payload.
   * @param jwe - The encrypted JWE token string
   * @returns A Promise that resolves to the decrypted string payload
   */
  async decrypt(jwe: string): Promise<string> {
    const jose = await import('jose');
    const secretKey = await this.secretKeyPromise;

    const { payload } = await jose.jwtDecrypt(jwe, secretKey); // Decrypts and verifies the token
    return payload.data as string; // Extracts and returns the original payload
  }
}
