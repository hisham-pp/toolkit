import pako from "pako";

/**
 * Compresses a string using pako (zlib/deflate) and returns a URL-safe Base64 string.
 */
export function compressData(data: string): string {
  try {
    const uint8Array = new TextEncoder().encode(data);
    const compressed = pako.deflate(uint8Array);
    return btoa(String.fromCharCode.apply(null, Array.from(compressed)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    console.error("Compression failed", e);
    return data;
  }
}

/**
 * Decompresses a URL-safe Base64 string back to the original string.
 */
export function decompressData(base64: string): string {
  try {
    // Reconstruct standard base64
    let standardBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    while (standardBase64.length % 4) {
      standardBase64 += '=';
    }
    
    const binary = atob(standardBase64);
    const uint8Array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      uint8Array[i] = binary.charCodeAt(i);
    }
    
    const decompressed = pako.inflate(uint8Array);
    return new TextDecoder().decode(decompressed);
  } catch (e) {
    console.error("Decompression failed", e);
    return base64;
  }
}
