import {
  AUTHENTICATOR_DATA_KEY,
  SSH_CONFIGS_KEY,
  SSH_VAULT_KEY,
} from "./storage-keys";

export const RELAY_URL = "https://ntfy.sh";
export const SYNC_SESSION_META_KEY = "toolkit-sync-session-meta";
export const SYNC_DEVICE_ID_KEY = "toolkit-sync-device-id";
export const SYNC_DEVICE_NAME_KEY = "toolkit-sync-device-name";
export const AUTO_RECONNECT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 12; // 12 days
export const PAIRING_RELAY_PREFIX = "toolkit-pair-";

export const SERVICE_DEFINITIONS = [
  { id: "todos", name: "Todos & Projects", keys: [], isTodos: true },
  { id: "authenticator", name: "Two-Step Authenticator", keys: [AUTHENTICATOR_DATA_KEY] },
  { id: "ssh", name: "SSH Configurations", keys: [SSH_CONFIGS_KEY, SSH_VAULT_KEY] },
] as const;

export const INTERNAL_SYNC_KEYS = new Set([
  SYNC_SESSION_META_KEY,
  SYNC_DEVICE_ID_KEY,
  SYNC_DEVICE_NAME_KEY,
]);
