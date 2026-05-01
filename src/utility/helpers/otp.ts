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
  let bits = "";
  let hex = "";

  for (let i = 0; i < cleanBase32.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleanBase32.charAt(i));
    if (val === -1) throw new Error("Invalid Base32 character");
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
 * @param secret Base32 encoded secret
 * @param period Time period in seconds (default 30)
 * @param digits Number of digits (default 6)
 */
export function generateTOTP(secret: string, period = 30, digits = 6): string {
  try {
    const secretHex = base32ToHex(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const time = Math.floor(epoch / period);
    
    // Convert time to 8-byte hex string
    let timeHex = time.toString(16).padStart(16, "0");
    
    // Compute HMAC-SHA1
    const hmac = CryptoJS.HmacSHA1(
      CryptoJS.enc.Hex.parse(timeHex),
      CryptoJS.enc.Hex.parse(secretHex)
    );
    
    const hmacHex = hmac.toString(CryptoJS.enc.Hex);
    
    // Dynamic Truncation
    const offset = parseInt(hmacHex.substring(hmacHex.length - 1), 16);
    const otp = (parseInt(hmacHex.substring(offset * 2, offset * 2 + 8), 16) & 0x7fffffff) + "";
    
    return otp.substring(otp.length - digits).padStart(digits, "0");
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
