import CryptoJS from "crypto-js";

/**
 * Base32 character set (RFC 4648)
 */
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Decodes a secret string based on the specified encoding.
 */
export function decodeSecret(secret: string, encoding: "auto" | "base32" | "hex" = "auto"): string {
  const cleanSecret = secret.toUpperCase().replace(/=+$/, "").replace(/[-\s]/g, "");
  if (!cleanSecret) return "";

  let mode = encoding;
  if (mode === "auto") {
    const containsNonBase32Hex = /[0189]/.test(cleanSecret);
    const isHexOnly = /^[0-9A-F]+$/.test(cleanSecret);
    const isBase32 = /^[A-Z2-7]+$/.test(cleanSecret);

    if (isHexOnly && (containsNonBase32Hex || !isBase32)) {
      mode = "hex";
    } else {
      mode = "base32";
    }
  }

  if (mode === "hex") {
    if (!/^[0-9A-F]+$/.test(cleanSecret)) {
      throw new Error("Invalid secret: Not a valid Hex string");
    }
    return cleanSecret.toLowerCase();
  }

  // Base32 decoding
  if (!/^[A-Z2-7]+$/.test(cleanSecret)) {
    throw new Error("Invalid secret: Not a valid Base32 string");
  }

  let bits = "";
  for (let i = 0; i < cleanSecret.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleanSecret[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }

  let hex = "";
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    const chunk = bits.substring(i, i + 8);
    hex += parseInt(chunk, 2).toString(16).padStart(2, "0");
  }

  return hex;
}

/**
 * Generates a TOTP code for a given secret.
 */
export function generateTOTP(
  secret: string, 
  period = 30, 
  digits = 6, 
  timestamp: number = Math.floor(Date.now() / 1000),
  algorithm = "SHA1",
  encoding: "auto" | "base32" | "hex" = "auto"
): string {
  if (!secret) return "0".repeat(digits);
  
  try {
    const secretHex = decodeSecret(secret, encoding);
    if (!secretHex) return "0".repeat(digits);

    const counter = Math.floor(timestamp / period);
    
    // Convert counter to 8-byte hex string (Big Endian)
    const timeHex = BigInt(counter).toString(16).padStart(16, "0");
    
    const message = CryptoJS.enc.Hex.parse(timeHex);
    const key = CryptoJS.enc.Hex.parse(secretHex);

    let hmac;
    const alg = algorithm.toUpperCase();
    if (alg === "SHA256") {
      hmac = CryptoJS.HmacSHA256(message, key);
    } else if (alg === "SHA512") {
      hmac = CryptoJS.HmacSHA512(message, key);
    } else {
      hmac = CryptoJS.HmacSHA1(message, key);
    }
    
    const hmacHex = hmac.toString(CryptoJS.enc.Hex);
    
    // Dynamic Truncation
    const offset = parseInt(hmacHex.substring(hmacHex.length - 1), 16);
    const binCode = parseInt(hmacHex.substring(offset * 2, offset * 2 + 8), 16) & 0x7fffffff;
    
    const otp = (binCode % Math.pow(10, digits)).toString();
    return otp.padStart(digits, "0");
  } catch (error) {
    // If it's our validation error, rethrow it
    if (error instanceof Error && (error.message.includes("Invalid secret") || error.message.includes("encoding"))) {
      throw error;
    }
    console.error("TOTP Generation Error:", error);
    return "0".repeat(digits);
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
