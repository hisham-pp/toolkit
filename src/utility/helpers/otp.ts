import CryptoJS from "crypto-js";

/**
 * Base32 character set (RFC 4648)
 */
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Decodes a Base32 string to a hex string.
 * TOTP secrets are typically Base32 encoded.
 */
export function base32ToHex(base32: string): string {
  const cleanBase32 = base32.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  if (!cleanBase32) return "";
  
  let bits = "";
  let hex = "";

  for (let i = 0; i < cleanBase32.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleanBase32.charAt(i));
    if (val === -1) {
      console.error(`Invalid Base32 character at index ${i}: ${cleanBase32.charAt(i)}`);
      throw new Error("Invalid Base32 character");
    }
    bits += val.toString(2).padStart(5, "0");
  }

  for (let i = 0; i + 8 <= bits.length; i += 8) {
    const chunk = bits.substring(i, i + 8);
    hex += parseInt(chunk, 2).toString(16).padStart(2, "0");
  }

  return hex;
}

/**
 * Generates a TOTP code for a given secret.
 */
export function generateTOTP(secret: string, period = 30, digits = 6): string {
  if (!secret) return "000000";
  
  try {
    const secretHex = base32ToHex(secret);
    if (!secretHex) return "000000";

    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / period);
    
    // Convert counter to 8-byte hex string (Big Endian)
    const timeHex = counter.toString(16).padStart(16, "0");
    
    // Compute HMAC-SHA1
    const hmac = CryptoJS.HmacSHA1(
      CryptoJS.enc.Hex.parse(timeHex),
      CryptoJS.enc.Hex.parse(secretHex)
    );
    
    const hmacHex = hmac.toString(CryptoJS.enc.Hex);
    
    // Dynamic Truncation
    const offset = parseInt(hmacHex.substring(hmacHex.length - 1), 16);
    const binCode = parseInt(hmacHex.substring(offset * 2, offset * 2 + 8), 16) & 0x7fffffff;
    
    const otp = (binCode % Math.pow(10, digits)).toString();
    return otp.padStart(digits, "0");
  } catch (error) {
    console.error("TOTP Generation Error:", error);
    return "000000";
  }
}

/**
 * Obfuscates data using AES encryption with a fixed application key.
 */
const APP_OBFUSCATION_KEY = "devhub-authenticator-obfuscation-key-2026";

export function obfuscate(data: string): string {
  return CryptoJS.AES.encrypt(data, APP_OBFUSCATION_KEY).toString();
}

export function deobfuscate(encryptedData: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, APP_OBFUSCATION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error("Deobfuscation Error:", e);
    return "";
  }
}
