"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Html5Qrcode } from "html5-qrcode";
import CryptoJS from "crypto-js";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Laptop2, RefreshCw, Smartphone } from "lucide-react";

import {
  AUTHENTICATOR_DATA_KEY,
  RECENT_TOOLS_KEY,
  SSH_CONFIGS_KEY,
  SSH_VAULT_KEY,
} from "@/utility/constants/storage-keys";
import { loadTodoWorkspace, saveTodoWorkspace, type TodoWorkspace } from "@/utility/helpers/todo-db";
import { compressData, decompressData } from "@/utility/helpers/sync";
import { cn } from "@/utility/helpers/utils";

if (typeof window !== "undefined") {
  const browserWindow = window as typeof window & {
    global?: typeof window;
    Buffer?: typeof import("buffer").Buffer;
    process?: { env: Record<string, string>; nextTick: (fn: () => void) => void; browser: boolean };
  };
  browserWindow.global = window;
  browserWindow.Buffer = browserWindow.Buffer || require("buffer").Buffer;
  browserWindow.process = browserWindow.process || {
    env: {},
    nextTick: (fn: () => void) => {
      window.setTimeout(fn, 0);
    },
    browser: true,
  };
}

type SyncPhase = "idle" | "pairing" | "connecting" | "confirming" | "connected" | "error";
type SyncRole = "sender" | "receiver" | null;
type SignalType = "JOIN" | "OFFER" | "ANSWER" | "APPROVE" | "REJECT" | "DISCONNECT";
type PeerMessageType =
  | "FULL_SNAPSHOT"
  | "SYNC_REQUEST"
  | "SYNC_RESULT"
  | "FORCE_APPLY"
  | "HELLO";
type SenderDeviceStatus =
  | "joined"
  | "offer_sent"
  | "awaiting_approval"
  | "connecting"
  | "connected"
  | "rejected"
  | "disconnected"
  | "error";

type SenderDevice = {
  id: string;
  name: string;
  status: SenderDeviceStatus;
  remoteSdp?: string;
  lastUpdated: number;
};

type SyncSnapshot = {
  storage: Record<string, string>;
  todos: TodoWorkspace;
  capturedAt: number;
  deviceId: string;
  deviceName: string;
};

type SyncRequestMessage = {
  type: "SYNC_REQUEST";
  requestId: string;
  snapshot: SyncSnapshot;
  snapshotHash: string;
  baseHash: string;
  originId: string;
  originName: string;
};

type SyncResultMessage = {
  type: "SYNC_RESULT";
  requestId: string;
  status: "noop" | "applied_requester" | "apply_remote" | "conflict" | "force_apply_complete";
  snapshot?: SyncSnapshot;
  snapshotHash?: string;
  remoteDeviceId: string;
  remoteDeviceName: string;
  resolvedHash?: string;
};

type FullSnapshotMessage = {
  type: "FULL_SNAPSHOT";
  snapshot: SyncSnapshot;
  snapshotHash: string;
  sourceId: string;
  sourceName: string;
};

type ForceApplyMessage = {
  type: "FORCE_APPLY";
  requestId: string;
  snapshot: SyncSnapshot;
  snapshotHash: string;
  originId: string;
  originName: string;
};

type HelloMessage = {
  type: "HELLO";
  deviceId: string;
  deviceName: string;
};

type PeerMessage = SyncRequestMessage | SyncResultMessage | FullSnapshotMessage | ForceApplyMessage | HelloMessage;

type ConnectionState = {
  lastResolvedHash: string;
  remoteDeviceId: string;
  remoteDeviceName: string;
};

type PendingRequest = {
  peerId: string;
  localSnapshot: SyncSnapshot;
  localHash: string;
};

type ConflictState = {
  requestId: string;
  peerId: string;
  localSnapshot: SyncSnapshot;
  localHash: string;
  remoteSnapshot: SyncSnapshot;
  remoteHash: string;
  remoteDeviceName: string;
};

type SyncContextValue = {
  deviceId: string;
  deviceName: string;
  setDeviceName: (value: string) => void;
  saveDeviceName: (value: string) => void;
  syncPhase: SyncPhase;
  p2pRole: SyncRole;
  signalId: string;
  encryptionKey: string;
  receiverDeviceId: string;
  receiverDeviceName: string;
  pairingString: string;
  manualPairingString: string;
  setManualPairingString: (value: string) => void;
  senderDevices: SenderDevice[];
  pendingSenderDevices: SenderDevice[];
  activeSenderDevices: SenderDevice[];
  connectionLogs: string[];
  remoteOfferSdp: string;
  isManualEntry: boolean;
  isRefreshing: boolean;
  hasActiveConnection: boolean;
  isConnectedToMultipleDevices: boolean;
  startSync: (role: "sender" | "receiver") => Promise<void>;
  startCamera: () => Promise<void>;
  cleanupSync: () => void;
  handleScannedData: (data: string) => void;
  handleReject: () => void;
  handleReceiverApproval: () => void;
  handleSenderApproval: (deviceId: string) => void;
  handleSenderReject: (deviceId: string) => void;
  disconnectSenderDevice: (deviceId: string) => void;
  requestManualSync: () => Promise<void>;
};

const RELAY_URL = "https://ntfy.sh";
const SYNC_SESSION_META_KEY = "toolkit-sync-session-meta";
const SYNC_DEVICE_ID_KEY = "toolkit-sync-device-id";
const SYNC_DEVICE_NAME_KEY = "toolkit-sync-device-name";
const AUTO_RECONNECT_MAX_AGE_MS = 1000 * 60 * 30;
const INTERNAL_SYNC_KEYS = new Set([SYNC_SESSION_META_KEY, SYNC_DEVICE_ID_KEY, SYNC_DEVICE_NAME_KEY]);

const persistentSyncRuntime = {
  peer: null as any,
  senderPeers: new Map<string, any>(),
  signalListenerCleanup: null as (() => void) | null,
  connectionStates: new Map<string, ConnectionState>(),
  pendingRequests: new Map<string, PendingRequest>(),
};

const SyncContext = createContext<SyncContextValue | null>(null);

function makeRandomHex(bytes: number) {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function makeDefaultDeviceName() {
  if (typeof navigator === "undefined") return "This Device";
  const isMobile = /android|iphone|ipad|mobile/i.test(navigator.userAgent);
  const label = isMobile ? "Mobile Device" : "Desktop Device";
  return label;
}

function isSignalPayload(value: unknown): value is { type: SignalType; sdp?: string; receiverId?: string; deviceName?: string } {
  if (!value || typeof value !== "object") return false;
  const maybeType = (value as { type?: string }).type;
  return typeof maybeType === "string";
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [PeerConstructor, setPeerConstructor] = useState<any>(null);
  const [syncPhase, setSyncPhase] = useState<SyncPhase>("idle");
  const [p2pRole, setP2pRole] = useState<SyncRole>(null);
  const [peer, setPeer] = useState<any>(persistentSyncRuntime.peer);
  const [senderDevices, setSenderDevices] = useState<SenderDevice[]>([]);
  const [signalId, setSignalId] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [receiverDeviceId, setReceiverDeviceId] = useState("");
  const [receiverDeviceName, setReceiverDeviceName] = useState("");
  const [manualPairingString, setManualPairingString] = useState("");
  const [remoteOfferSdp, setRemoteOfferSdp] = useState("");
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [conflictState, setConflictState] = useState<ConflictState | null>(null);
  const restoredSessionRef = useRef<any>(null);
  const hasAutoReconnectAttemptedRef = useRef(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerAlignTimeoutRef = useRef<number | null>(null);

  const addLog = useCallback((msg: string) => {
    setConnectionLogs((prev) => [...prev.slice(-5), msg]);
  }, []);

  const computeSyncHash = useCallback((snapshot: SyncSnapshot) => {
    return CryptoJS.MD5(JSON.stringify(snapshot)).toString();
  }, []);

  const saveDeviceName = useCallback((value: string) => {
    const nextName = value.trim() || makeDefaultDeviceName();
    setDeviceName(nextName);
    if (typeof window !== "undefined") {
      localStorage.setItem(SYNC_DEVICE_NAME_KEY, nextName);
    }
    toast.success(`Device name saved as ${nextName}`);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedDeviceId = localStorage.getItem(SYNC_DEVICE_ID_KEY) || makeRandomHex(8);
    const savedDeviceName = localStorage.getItem(SYNC_DEVICE_NAME_KEY) || makeDefaultDeviceName();
    localStorage.setItem(SYNC_DEVICE_ID_KEY, savedDeviceId);
    localStorage.setItem(SYNC_DEVICE_NAME_KEY, savedDeviceName);
    setDeviceId(savedDeviceId);
    setDeviceName(savedDeviceName);

    try {
      const saved = localStorage.getItem(SYNC_SESSION_META_KEY);
      if (!saved) return;
      const meta = JSON.parse(saved);
      restoredSessionRef.current = meta;
      if (meta?.signalId) setSignalId(meta.signalId);
      if (meta?.encryptionKey) setEncryptionKey(meta.encryptionKey);
      if (meta?.role) setP2pRole(meta.role);
      if (meta?.syncPhase) setSyncPhase(meta.syncPhase);
      if (meta?.receiverDeviceId) setReceiverDeviceId(meta.receiverDeviceId);
      if (meta?.receiverDeviceName) setReceiverDeviceName(meta.receiverDeviceName);
      if (Array.isArray(meta?.senderDevices)) setSenderDevices(meta.senderDevices);
      if (persistentSyncRuntime.peer) setPeer(persistentSyncRuntime.peer);
    } catch (error) {
      console.error("Failed to restore sync session metadata", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    import("simple-peer").then((module) => {
      setPeerConstructor(() => module.default);
    });
  }, []);

  const gatherSnapshot = useCallback(async (): Promise<SyncSnapshot> => {
    const storage: Record<string, string> = {};
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key || INTERNAL_SYNC_KEYS.has(key)) continue;
      const value = localStorage.getItem(key);
      if (value !== null) storage[key] = value;
    }

    const todos = await loadTodoWorkspace();
    return {
      storage,
      todos,
      capturedAt: Date.now(),
      deviceId,
      deviceName: deviceName || makeDefaultDeviceName(),
    };
  }, [deviceId, deviceName]);

  const applySnapshot = useCallback(async (snapshot: SyncSnapshot) => {
    const currentKeys: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key || INTERNAL_SYNC_KEYS.has(key)) continue;
      currentKeys.push(key);
    }

    currentKeys.forEach((key) => {
      if (!(key in snapshot.storage)) {
        localStorage.removeItem(key);
      }
    });

    Object.entries(snapshot.storage).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    await saveTodoWorkspace(snapshot.todos ?? { projects: [], todos: [] });
  }, []);

  const updateConnectionState = useCallback((peerId: string, updates: Partial<ConnectionState>) => {
    const current = persistentSyncRuntime.connectionStates.get(peerId) ?? {
      lastResolvedHash: "",
      remoteDeviceId: peerId,
      remoteDeviceName: "Other Device",
    };
    persistentSyncRuntime.connectionStates.set(peerId, { ...current, ...updates });
  }, []);

  const updateSenderDevice = useCallback((id: string, updates: Partial<SenderDevice>) => {
    setSenderDevices((prev) => {
      const existing = prev.find((device) => device.id === id);
      if (!existing) {
        return [
          ...prev,
          {
            id,
            name: updates.name || "Other Device",
            status: "joined",
            lastUpdated: Date.now(),
            ...updates,
          },
        ];
      }

      return prev.map((device) =>
        device.id === id
          ? {
              ...device,
              ...updates,
              name: updates.name || device.name,
              lastUpdated: Date.now(),
            }
          : device,
      );
    });
  }, []);

  const removeSenderPeer = useCallback((id: string) => {
    const senderPeer = persistentSyncRuntime.senderPeers.get(id);
    if (senderPeer) {
      senderPeer.destroy();
      persistentSyncRuntime.senderPeers.delete(id);
    }
    persistentSyncRuntime.connectionStates.delete(id);
  }, []);

  const cleanupScanner = useCallback(() => {
    if (html5QrCodeRef.current) {
      if (html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
      html5QrCodeRef.current = null;
    }
    if (scannerAlignTimeoutRef.current !== null) {
      window.clearTimeout(scannerAlignTimeoutRef.current);
      scannerAlignTimeoutRef.current = null;
    }
  }, []);

  const cleanupSync = useCallback(() => {
    addLog("Cleaning up sync session");
    cleanupScanner();
    if (persistentSyncRuntime.peer) {
      persistentSyncRuntime.peer.destroy();
    }
    persistentSyncRuntime.senderPeers.forEach((senderPeer) => senderPeer.destroy());
    persistentSyncRuntime.senderPeers.clear();
    if (persistentSyncRuntime.signalListenerCleanup) {
      persistentSyncRuntime.signalListenerCleanup();
      persistentSyncRuntime.signalListenerCleanup = null;
    }
    persistentSyncRuntime.connectionStates.clear();
    persistentSyncRuntime.pendingRequests.clear();
    persistentSyncRuntime.peer = null;
    setPeer(null);
    setSyncPhase("idle");
    setP2pRole(null);
    setSignalId("");
    setEncryptionKey("");
    setReceiverDeviceId("");
    setReceiverDeviceName("");
    setManualPairingString("");
    setRemoteOfferSdp("");
    setSenderDevices([]);
    setIsRefreshing(false);
    setConflictState(null);
  }, [addLog, cleanupScanner]);

  useEffect(() => {
    return () => {
      cleanupScanner();
    };
  }, [cleanupScanner]);

  const sendSignal = useCallback(
    async (id: string, key: string, type: SignalType, options?: { sdp?: string; receiverId?: string; deviceName?: string }) => {
      try {
        const payload = {
          type,
          receiverId: options?.receiverId,
          deviceName: options?.deviceName,
          sdp: options?.sdp ? compressData(options.sdp) : undefined,
        };
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key).toString();
        await fetch(`${RELAY_URL}/${id}`, {
          method: "POST",
          body: encrypted,
          headers: { Title: "Toolkit Sync" },
        });
      } catch (error) {
        console.error("Signal Send Error", error);
      }
    },
    [],
  );

  const pollForSignal = useCallback(
    (
      id: string,
      key: string,
      targetTypes: SignalType[],
      onSignal: (signal: { type: SignalType; sdp?: string; receiverId?: string; deviceName?: string }) => void,
      receiverId?: string,
    ) => {
      const seenIds = new Set<string>();

      const parseCachedMessages = (raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed) return [];
        try {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return trimmed
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              try {
                return JSON.parse(line);
              } catch {
                return null;
              }
            })
            .filter(Boolean);
        }
      };

      const processMessage = (msg: any) => {
        if (seenIds.has(msg.id)) return;
        seenIds.add(msg.id);

        const encryptedData = msg.message || msg.body;
        if (!encryptedData || typeof encryptedData !== "string") return;

        try {
          const bytes = CryptoJS.AES.decrypt(encryptedData, key);
          const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
          if (!decryptedStr) return;
          const decrypted = JSON.parse(decryptedStr);
          if (!isSignalPayload(decrypted)) return;
          if (receiverId && decrypted.receiverId !== receiverId) return;
          if (!targetTypes.includes(decrypted.type)) return;
          onSignal({
            type: decrypted.type,
            sdp: decrypted.sdp ? decompressData(decrypted.sdp) : undefined,
            receiverId: decrypted.receiverId,
            deviceName: decrypted.deviceName,
          });
        } catch (error) {
          console.error("Signal processing error", error);
        }
      };

      const checkOnce = async () => {
        try {
          const response = await fetch(`${RELAY_URL}/${id}/json?poll=1`);
          const raw = await response.text();
          parseCachedMessages(raw).forEach(processMessage);
        } catch (error) {
          console.error("Failed to fetch cached signals", error);
        }
      };

      checkOnce();
      const eventSource = new EventSource(`${RELAY_URL}/${id}/sse`);
      eventSource.onmessage = (event) => {
        try {
          processMessage(JSON.parse(event.data));
        } catch (error) {
          console.error("SSE processing error", error);
        }
      };
      eventSource.onerror = () => addLog("Relay listener encountered a temporary error");

      return () => {
        eventSource.close();
      };
    },
    [addLog],
  );

  const sendPeerMessage = useCallback((targetPeer: any, message: PeerMessage) => {
    targetPeer.send(JSON.stringify(message));
  }, []);

  const sendInitialSnapshot = useCallback(
    async (targetPeer: any, peerId: string) => {
      const snapshot = await gatherSnapshot();
      const snapshotHash = computeSyncHash(snapshot);
      sendPeerMessage(targetPeer, {
        type: "FULL_SNAPSHOT",
        snapshot,
        snapshotHash,
        sourceId: deviceId,
        sourceName: deviceName,
      });
      updateConnectionState(peerId, {
        lastResolvedHash: snapshotHash,
        remoteDeviceId: peerId,
      });
    },
    [computeSyncHash, deviceId, deviceName, gatherSnapshot, sendPeerMessage, updateConnectionState],
  );

  const onSyncResult = useCallback(
    async (message: SyncResultMessage) => {
      const pending = persistentSyncRuntime.pendingRequests.get(message.requestId);
      if (!pending) return;

      if (message.status === "noop" || message.status === "applied_requester" || message.status === "force_apply_complete") {
        updateConnectionState(pending.peerId, {
          lastResolvedHash: message.resolvedHash || pending.localHash,
          remoteDeviceName: message.remoteDeviceName,
          remoteDeviceId: message.remoteDeviceId,
        });
        setIsRefreshing(false);
        persistentSyncRuntime.pendingRequests.delete(message.requestId);
        toast.success(`Synced with ${message.remoteDeviceName}`);
        return;
      }

      if (message.status === "apply_remote" && message.snapshot && message.snapshotHash) {
        await applySnapshot(message.snapshot);
        updateConnectionState(pending.peerId, {
          lastResolvedHash: message.snapshotHash,
          remoteDeviceName: message.remoteDeviceName,
          remoteDeviceId: message.remoteDeviceId,
        });
        setIsRefreshing(false);
        persistentSyncRuntime.pendingRequests.delete(message.requestId);
        toast.success(`Pulled changes from ${message.remoteDeviceName}`);
        return;
      }

      if (message.status === "conflict" && message.snapshot && message.snapshotHash) {
        setConflictState({
          requestId: message.requestId,
          peerId: pending.peerId,
          localSnapshot: pending.localSnapshot,
          localHash: pending.localHash,
          remoteSnapshot: message.snapshot,
          remoteHash: message.snapshotHash,
          remoteDeviceName: message.remoteDeviceName,
        });
      }
    },
    [applySnapshot, updateConnectionState],
  );

  const handleIncomingSyncRequest = useCallback(
    async (originPeerId: string, originPeer: any, message: SyncRequestMessage) => {
      const localSnapshot = await gatherSnapshot();
      const localHash = computeSyncHash(localSnapshot);
      const baseHash = persistentSyncRuntime.connectionStates.get(originPeerId)?.lastResolvedHash || message.baseHash;

      updateConnectionState(originPeerId, {
        remoteDeviceId: message.originId,
        remoteDeviceName: message.originName,
      });

      if (localHash === message.snapshotHash) {
        sendPeerMessage(originPeer, {
          type: "SYNC_RESULT",
          requestId: message.requestId,
          status: "noop",
          remoteDeviceId: deviceId,
          remoteDeviceName: deviceName,
          resolvedHash: localHash,
        });
        return;
      }

      if (baseHash && localHash === baseHash) {
        await applySnapshot(message.snapshot);
        updateConnectionState(originPeerId, {
          lastResolvedHash: message.snapshotHash,
          remoteDeviceId: message.originId,
          remoteDeviceName: message.originName,
        });
        sendPeerMessage(originPeer, {
          type: "SYNC_RESULT",
          requestId: message.requestId,
          status: "applied_requester",
          remoteDeviceId: deviceId,
          remoteDeviceName: deviceName,
          resolvedHash: message.snapshotHash,
        });
        toast.success(`Applied changes from ${message.originName}`);
        return;
      }

      if (baseHash && message.snapshotHash === baseHash) {
        sendPeerMessage(originPeer, {
          type: "SYNC_RESULT",
          requestId: message.requestId,
          status: "apply_remote",
          snapshot: localSnapshot,
          snapshotHash: localHash,
          remoteDeviceId: deviceId,
          remoteDeviceName: deviceName,
        });
        return;
      }

      sendPeerMessage(originPeer, {
        type: "SYNC_RESULT",
        requestId: message.requestId,
        status: "conflict",
        snapshot: localSnapshot,
        snapshotHash: localHash,
        remoteDeviceId: deviceId,
        remoteDeviceName: deviceName,
      });
    },
    [applySnapshot, computeSyncHash, deviceId, deviceName, gatherSnapshot, sendPeerMessage, updateConnectionState],
  );

  const handlePeerData = useCallback(
    async (originPeerId: string, originPeer: any, rawData: any) => {
      const message = JSON.parse(rawData.toString()) as PeerMessage;

      if (message.type === "HELLO") {
        updateConnectionState(originPeerId, {
          remoteDeviceId: message.deviceId,
          remoteDeviceName: message.deviceName,
        });
        setReceiverDeviceName(message.deviceName);
        updateSenderDevice(originPeerId, { name: message.deviceName });
        return;
      }

      if (message.type === "FULL_SNAPSHOT") {
        await applySnapshot(message.snapshot);
        updateConnectionState(originPeerId, {
          lastResolvedHash: message.snapshotHash,
          remoteDeviceId: message.sourceId,
          remoteDeviceName: message.sourceName,
        });
        setReceiverDeviceName(message.sourceName);
        toast.success(`Initial sync loaded from ${message.sourceName}`);
        setSyncPhase("connected");
        return;
      }

      if (message.type === "SYNC_REQUEST") {
        await handleIncomingSyncRequest(originPeerId, originPeer, message);
        return;
      }

      if (message.type === "SYNC_RESULT") {
        await onSyncResult(message);
        return;
      }

      if (message.type === "FORCE_APPLY") {
        await applySnapshot(message.snapshot);
        updateConnectionState(originPeerId, {
          lastResolvedHash: message.snapshotHash,
          remoteDeviceId: message.originId,
          remoteDeviceName: message.originName,
        });
        sendPeerMessage(originPeer, {
          type: "SYNC_RESULT",
          requestId: message.requestId,
          status: "force_apply_complete",
          remoteDeviceId: deviceId,
          remoteDeviceName: deviceName,
          resolvedHash: message.snapshotHash,
        });
        toast.success(`Applied ${message.originName}'s version`);
      }
    },
    [applySnapshot, deviceId, deviceName, handleIncomingSyncRequest, onSyncResult, sendPeerMessage, updateConnectionState, updateSenderDevice],
  );

  const createSenderPeer = useCallback(
    async (targetReceiverId: string, targetReceiverName: string, sId: string, eKey: string) => {
      if (!PeerConstructor || persistentSyncRuntime.senderPeers.has(targetReceiverId)) return;

      updateSenderDevice(targetReceiverId, { status: "joined", name: targetReceiverName || "Other Device" });
      const nextPeer = new PeerConstructor({
        initiator: true,
        trickle: false,
        config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
      });
      persistentSyncRuntime.senderPeers.set(targetReceiverId, nextPeer);

      nextPeer.on("signal", (data: any) => {
        sendSignal(sId, eKey, "OFFER", {
          sdp: JSON.stringify(data),
          receiverId: targetReceiverId,
          deviceName,
        });
        updateSenderDevice(targetReceiverId, { status: "offer_sent", name: targetReceiverName || "Other Device" });
      });

      nextPeer.on("connect", async () => {
        updateSenderDevice(targetReceiverId, { status: "connected" });
        setSyncPhase("connected");
        sendPeerMessage(nextPeer, {
          type: "HELLO",
          deviceId,
          deviceName,
        });
        await sendInitialSnapshot(nextPeer, targetReceiverId);
      });

      nextPeer.on("data", async (data: any) => {
        await handlePeerData(targetReceiverId, nextPeer, data);
      });

      nextPeer.on("close", () => {
        updateSenderDevice(targetReceiverId, { status: "disconnected" });
        persistentSyncRuntime.senderPeers.delete(targetReceiverId);
        persistentSyncRuntime.connectionStates.delete(targetReceiverId);
      });

      nextPeer.on("error", (error: any) => {
        console.error(error);
        updateSenderDevice(targetReceiverId, { status: "error" });
      });
    },
    [PeerConstructor, deviceId, deviceName, handlePeerData, sendInitialSnapshot, sendPeerMessage, sendSignal, updateSenderDevice],
  );

  const startSync = useCallback(
    async (role: "sender" | "receiver") => {
      if (!PeerConstructor) {
        toast.error("Sync engine is still loading. Refresh once if it stays stuck.");
        return;
      }

      const sId = makeRandomHex(12);
      const eKey = makeRandomHex(16);
      setP2pRole(role);
      setSyncPhase("pairing");
      setSignalId(sId);
      setEncryptionKey(eKey);
      setReceiverDeviceName("");

      if (role === "sender") {
        if (persistentSyncRuntime.signalListenerCleanup) {
          persistentSyncRuntime.signalListenerCleanup();
        }
        persistentSyncRuntime.signalListenerCleanup = pollForSignal(
          sId,
          eKey,
          ["JOIN", "ANSWER", "REJECT", "DISCONNECT"],
          async ({ type, sdp, receiverId: joinedReceiverId, deviceName: joinedDeviceName }) => {
            if (!joinedReceiverId) return;

            if (type === "JOIN") {
              updateSenderDevice(joinedReceiverId, { status: "joined", name: joinedDeviceName || "Other Device" });
              await createSenderPeer(joinedReceiverId, joinedDeviceName || "Other Device", sId, eKey);
              return;
            }

            if (type === "ANSWER") {
              updateSenderDevice(joinedReceiverId, {
                status: "awaiting_approval",
                remoteSdp: sdp,
                name: joinedDeviceName || persistentSyncRuntime.connectionStates.get(joinedReceiverId)?.remoteDeviceName || "Other Device",
              });
              return;
            }

            if (type === "REJECT") {
              updateSenderDevice(joinedReceiverId, { status: "rejected" });
              removeSenderPeer(joinedReceiverId);
              return;
            }

            if (type === "DISCONNECT") {
              updateSenderDevice(joinedReceiverId, { status: "disconnected" });
              removeSenderPeer(joinedReceiverId);
            }
          },
        );
      }
    },
    [PeerConstructor, createSenderPeer, pollForSignal, removeSenderPeer, updateSenderDevice],
  );

  const handleSenderApproval = useCallback(
    (targetDeviceId: string) => {
      const senderPeer = persistentSyncRuntime.senderPeers.get(targetDeviceId);
      const targetDevice = senderDevices.find((entry) => entry.id === targetDeviceId);
      if (!senderPeer || !targetDevice?.remoteSdp || !signalId || !encryptionKey) return;

      setSyncPhase("connecting");
      updateSenderDevice(targetDeviceId, { status: "connecting" });
      sendSignal(signalId, encryptionKey, "APPROVE", { receiverId: targetDeviceId, deviceName });
      senderPeer.signal(JSON.parse(targetDevice.remoteSdp));
    },
    [deviceName, encryptionKey, senderDevices, sendSignal, signalId, updateSenderDevice],
  );

  const disconnectSenderDevice = useCallback(
    (targetDeviceId: string) => {
      if (signalId && encryptionKey) {
        sendSignal(signalId, encryptionKey, "DISCONNECT", { receiverId: targetDeviceId, deviceName });
      }
      updateSenderDevice(targetDeviceId, { status: "disconnected" });
      removeSenderPeer(targetDeviceId);
    },
    [deviceName, encryptionKey, removeSenderPeer, sendSignal, signalId, updateSenderDevice],
  );

  const handleSenderReject = useCallback(
    (targetDeviceId: string) => {
      if (signalId && encryptionKey) {
        sendSignal(signalId, encryptionKey, "REJECT", { receiverId: targetDeviceId, deviceName });
      }
      updateSenderDevice(targetDeviceId, { status: "rejected" });
      removeSenderPeer(targetDeviceId);
    },
    [deviceName, encryptionKey, removeSenderPeer, sendSignal, signalId, updateSenderDevice],
  );

  const handleScannedData = useCallback(
    (data: string) => {
      if (!data.startsWith("toolkit-sync:v1:")) {
        toast.error("Invalid pairing code");
        return;
      }

      const [, , sId, eKey] = data.split(":");
      setP2pRole("receiver");
      setSignalId(sId);
      setEncryptionKey(eKey);
      const localReceiverId = deviceId || makeRandomHex(8);
      setReceiverDeviceId(localReceiverId);
      setSyncPhase("connecting");

      sendSignal(sId, eKey, "JOIN", { receiverId: localReceiverId, deviceName });
      if (persistentSyncRuntime.signalListenerCleanup) {
        persistentSyncRuntime.signalListenerCleanup();
      }
      persistentSyncRuntime.signalListenerCleanup = pollForSignal(
        sId,
        eKey,
        ["OFFER", "REJECT", "DISCONNECT"],
        ({ type, sdp, deviceName: sourceName }) => {
          if (type === "REJECT" || type === "DISCONNECT") {
            cleanupSync();
            return;
          }
          setRemoteOfferSdp(sdp || "");
          setReceiverDeviceName(sourceName || "Other Device");
          setSyncPhase("confirming");
        },
        localReceiverId,
      );
    },
    [cleanupSync, deviceId, deviceName, pollForSignal, sendSignal],
  );

  const handleReceiverApproval = useCallback(() => {
    if (!PeerConstructor) return;
    if (!remoteOfferSdp) {
      toast.error("Waiting for the source device offer");
      return;
    }
    if (!receiverDeviceId) {
      toast.error("Missing current device id");
      return;
    }

    const nextPeer = new PeerConstructor({
      initiator: false,
      trickle: false,
      config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
    });

    nextPeer.on("signal", (answerData: any) => {
      sendSignal(signalId, encryptionKey, "ANSWER", {
        sdp: JSON.stringify(answerData),
        receiverId: receiverDeviceId,
        deviceName,
      });
      setSyncPhase("connecting");
      if (persistentSyncRuntime.signalListenerCleanup) {
        persistentSyncRuntime.signalListenerCleanup();
      }
      persistentSyncRuntime.signalListenerCleanup = pollForSignal(
        signalId,
        encryptionKey,
        ["APPROVE", "REJECT", "DISCONNECT"],
        ({ type }) => {
          if (type === "APPROVE") {
            setSyncPhase("connected");
            return;
          }
          cleanupSync();
        },
        receiverDeviceId,
      );
    });

    nextPeer.on("connect", () => {
      persistentSyncRuntime.peer = nextPeer;
      setPeer(nextPeer);
      setSyncPhase("connected");
      sendPeerMessage(nextPeer, {
        type: "HELLO",
        deviceId,
        deviceName,
      });
    });

    nextPeer.on("data", async (data: any) => {
      await handlePeerData(receiverDeviceId, nextPeer, data);
    });

    nextPeer.on("close", cleanupSync);
    nextPeer.on("error", () => setSyncPhase("error"));

    try {
      nextPeer.signal(JSON.parse(remoteOfferSdp));
    } catch (error) {
      console.error(error);
      toast.error("Invalid connection offer");
      cleanupSync();
      return;
    }

    persistentSyncRuntime.peer = nextPeer;
    setPeer(nextPeer);
  }, [
    PeerConstructor,
    cleanupSync,
    deviceId,
    deviceName,
    encryptionKey,
    handlePeerData,
    pollForSignal,
    receiverDeviceId,
    remoteOfferSdp,
    sendPeerMessage,
    sendSignal,
    signalId,
  ]);

  const handleReject = useCallback(() => {
    if (signalId && encryptionKey) {
      sendSignal(signalId, encryptionKey, "REJECT", {
        receiverId: receiverDeviceId || undefined,
        deviceName,
      });
    }
    cleanupSync();
  }, [cleanupSync, deviceName, encryptionKey, receiverDeviceId, sendSignal, signalId]);

  const resumeSenderSession = useCallback(
    (sId: string, eKey: string, savedDevices: SenderDevice[] = []) => {
      setP2pRole("sender");
      setSignalId(sId);
      setEncryptionKey(eKey);
      setSyncPhase(savedDevices.some((device) => device.status === "connected") ? "connected" : "pairing");
      setSenderDevices(
        savedDevices.map((device) => ({
          ...device,
          status: device.status === "connected" ? "disconnected" : device.status,
        })),
      );

      if (persistentSyncRuntime.signalListenerCleanup) {
        persistentSyncRuntime.signalListenerCleanup();
      }
      persistentSyncRuntime.signalListenerCleanup = pollForSignal(
        sId,
        eKey,
        ["JOIN", "ANSWER", "REJECT", "DISCONNECT"],
        async ({ type, sdp, receiverId: targetId, deviceName: targetName }) => {
          if (!targetId) return;
          if (type === "JOIN") {
            updateSenderDevice(targetId, { status: "joined", name: targetName || "Other Device" });
            await createSenderPeer(targetId, targetName || "Other Device", sId, eKey);
            return;
          }
          if (type === "ANSWER") {
            updateSenderDevice(targetId, { status: "awaiting_approval", remoteSdp: sdp, name: targetName || "Other Device" });
            return;
          }
          if (type === "REJECT") {
            updateSenderDevice(targetId, { status: "rejected" });
            removeSenderPeer(targetId);
            return;
          }
          if (type === "DISCONNECT") {
            updateSenderDevice(targetId, { status: "disconnected" });
            removeSenderPeer(targetId);
          }
        },
      );
    },
    [createSenderPeer, pollForSignal, removeSenderPeer, updateSenderDevice],
  );

  const resumeReceiverSession = useCallback(
    (sId: string, eKey: string, currentReceiverId: string, currentReceiverName: string) => {
      setP2pRole("receiver");
      setSignalId(sId);
      setEncryptionKey(eKey);
      setReceiverDeviceId(currentReceiverId);
      setReceiverDeviceName(currentReceiverName);
      setSyncPhase("connecting");

      sendSignal(sId, eKey, "JOIN", { receiverId: currentReceiverId, deviceName });
      if (persistentSyncRuntime.signalListenerCleanup) {
        persistentSyncRuntime.signalListenerCleanup();
      }
      persistentSyncRuntime.signalListenerCleanup = pollForSignal(
        sId,
        eKey,
        ["OFFER", "REJECT", "DISCONNECT"],
        ({ type, sdp, deviceName: sourceName }) => {
          if (type === "REJECT" || type === "DISCONNECT") {
            cleanupSync();
            return;
          }
          setRemoteOfferSdp(sdp || "");
          setReceiverDeviceName(sourceName || currentReceiverName || "Other Device");
          setSyncPhase("confirming");
        },
        currentReceiverId,
      );
    },
    [cleanupSync, deviceName, pollForSignal, sendSignal],
  );

  useEffect(() => {
    if (!PeerConstructor || hasAutoReconnectAttemptedRef.current) return;

    const meta = restoredSessionRef.current;
    if (!meta?.signalId || !meta?.encryptionKey || !meta?.role || !meta?.savedAt) return;
    if (Date.now() - meta.savedAt > AUTO_RECONNECT_MAX_AGE_MS) return;
    if (meta.syncPhase === "idle") return;

    hasAutoReconnectAttemptedRef.current = true;

    if (meta.role === "sender") {
      resumeSenderSession(meta.signalId, meta.encryptionKey, Array.isArray(meta.senderDevices) ? meta.senderDevices : []);
      return;
    }

    if (meta.role === "receiver" && meta.receiverDeviceId) {
      resumeReceiverSession(meta.signalId, meta.encryptionKey, meta.receiverDeviceId, meta.receiverDeviceName || "Other Device");
    }
  }, [PeerConstructor, resumeReceiverSession, resumeSenderSession]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sessionMeta = {
      savedAt: Date.now(),
      role: p2pRole,
      syncPhase,
      signalId,
      encryptionKey,
      receiverDeviceId,
      receiverDeviceName,
      senderDevices: senderDevices.map(({ id, name, status, lastUpdated }) => ({
        id,
        name,
        status,
        lastUpdated,
      })),
    };
    localStorage.setItem(SYNC_SESSION_META_KEY, JSON.stringify(sessionMeta));
  }, [encryptionKey, p2pRole, receiverDeviceId, receiverDeviceName, senderDevices, signalId, syncPhase]);

  const requestManualSync = useCallback(async () => {
    if (conflictState) {
      toast.error("Resolve the current sync conflict first");
      return;
    }

    if (p2pRole === "sender") {
      const connected = senderDevices.filter((device) => device.status === "connected");
      if (!connected.length) {
        toast.error("Connect another device first");
        return;
      }

      setIsRefreshing(true);
      const snapshot = await gatherSnapshot();
      const snapshotHash = computeSyncHash(snapshot);
      connected.forEach((device) => {
        const activePeer = persistentSyncRuntime.senderPeers.get(device.id);
        if (!activePeer) return;
        const requestId = crypto.randomUUID();
        persistentSyncRuntime.pendingRequests.set(requestId, {
          peerId: device.id,
          localSnapshot: snapshot,
          localHash: snapshotHash,
        });
        sendPeerMessage(activePeer, {
          type: "SYNC_REQUEST",
          requestId,
          snapshot,
          snapshotHash,
          baseHash: persistentSyncRuntime.connectionStates.get(device.id)?.lastResolvedHash || "",
          originId: deviceId,
          originName: deviceName,
        });
      });
      return;
    }

    if (p2pRole === "receiver" && peer) {
      setIsRefreshing(true);
      const snapshot = await gatherSnapshot();
      const snapshotHash = computeSyncHash(snapshot);
      const requestId = crypto.randomUUID();
      persistentSyncRuntime.pendingRequests.set(requestId, {
        peerId: receiverDeviceId || "host",
        localSnapshot: snapshot,
        localHash: snapshotHash,
      });
      sendPeerMessage(peer, {
        type: "SYNC_REQUEST",
        requestId,
        snapshot,
        snapshotHash,
        baseHash: persistentSyncRuntime.connectionStates.get(receiverDeviceId || "host")?.lastResolvedHash || "",
        originId: deviceId,
        originName: deviceName,
      });
      return;
    }

    toast.error("Open Settings & Sync and connect a device first");
  }, [computeSyncHash, conflictState, deviceId, deviceName, gatherSnapshot, p2pRole, peer, receiverDeviceId, sendPeerMessage, senderDevices]);

  const resolveConflict = useCallback(
    async (choice: "local" | "remote") => {
      if (!conflictState) return;

      const targetPeer =
        p2pRole === "sender"
          ? persistentSyncRuntime.senderPeers.get(conflictState.peerId)
          : persistentSyncRuntime.peer;

      if (choice === "local" && targetPeer) {
        sendPeerMessage(targetPeer, {
          type: "FORCE_APPLY",
          requestId: conflictState.requestId,
          snapshot: conflictState.localSnapshot,
          snapshotHash: conflictState.localHash,
          originId: deviceId,
          originName: deviceName,
        });
        updateConnectionState(conflictState.peerId, {
          lastResolvedHash: conflictState.localHash,
          remoteDeviceName: conflictState.remoteDeviceName,
        });
        toast.success(`Kept ${deviceName} changes`);
      }

      if (choice === "remote") {
        await applySnapshot(conflictState.remoteSnapshot);
        updateConnectionState(conflictState.peerId, {
          lastResolvedHash: conflictState.remoteHash,
          remoteDeviceName: conflictState.remoteDeviceName,
        });
        toast.success(`Applied ${conflictState.remoteDeviceName} changes`);
      }

      persistentSyncRuntime.pendingRequests.delete(conflictState.requestId);
      setConflictState(null);
      setIsRefreshing(false);
    },
    [applySnapshot, conflictState, deviceId, deviceName, p2pRole, sendPeerMessage, updateConnectionState],
  );

  const alignScannerPreview = useCallback(() => {
    const reader = document.getElementById("qr-reader");
    if (!reader) return;

    const readerRect = reader.getBoundingClientRect();
    if (!readerRect.width || !readerRect.height) return;

    reader.style.display = "flex";
    reader.style.alignItems = "center";
    reader.style.justifyContent = "center";
    reader.style.overflow = "hidden";
    reader.style.background = "#09090b";
    reader.style.position = "absolute";

    const video = reader.querySelector("video");
    if (video) {
      const videoWidth = video.videoWidth || 1280;
      const videoHeight = video.videoHeight || 720;
      const videoAspect = videoWidth / videoHeight;
      const readerAspect = readerRect.width / readerRect.height;

      let fittedWidth = readerRect.width;
      let fittedHeight = readerRect.height;
      if (videoAspect > readerAspect) {
        fittedHeight = readerRect.height;
        fittedWidth = fittedHeight * videoAspect;
      } else {
        fittedWidth = readerRect.width;
        fittedHeight = fittedWidth / videoAspect;
      }

      video.style.position = "absolute";
      video.style.top = "50%";
      video.style.left = "50%";
      video.style.width = `${fittedWidth}px`;
      video.style.height = `${fittedHeight}px`;
      video.style.maxWidth = "none";
      video.style.maxHeight = "none";
      video.style.transform = "translate(-50%, -50%)";
      video.style.borderRadius = "inherit";
      video.setAttribute("playsinline", "true");
    }
  }, []);

  const scheduleScannerAlignment = useCallback(
    (attempt = 0) => {
      alignScannerPreview();
      if (attempt >= 24) {
        scannerAlignTimeoutRef.current = null;
        return;
      }
      scannerAlignTimeoutRef.current = window.setTimeout(() => {
        scheduleScannerAlignment(attempt + 1);
      }, 120);
    },
    [alignScannerPreview],
  );

  const startCamera = useCallback(async () => {
    setIsManualEntry(false);
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => ({
            width: Math.floor(Math.max(220, Math.min(viewfinderWidth * 0.9, viewfinderWidth - 24))),
            height: Math.floor(Math.max(260, Math.min(viewfinderHeight * 0.82, viewfinderHeight - 24))),
          }),
        },
        (decodedText) => {
          handleScannedData(decodedText);
          html5QrCode.stop().catch(console.error);
        },
        () => {},
      );

      scheduleScannerAlignment();
    } catch (error) {
      console.error(error);
      toast.error("Could not open the camera. Use manual entry instead.");
      setIsManualEntry(true);
    }
  }, [handleScannedData, scheduleScannerAlignment]);

  const pendingSenderDevices = useMemo(
    () => senderDevices.filter((device) => device.status === "awaiting_approval"),
    [senderDevices],
  );
  const activeSenderDevices = useMemo(
    () => senderDevices.filter((device) => device.status !== "awaiting_approval"),
    [senderDevices],
  );
  const hasActiveConnection =
    senderDevices.some((device) => device.status === "connected") ||
    (p2pRole === "receiver" && syncPhase === "connected" && Boolean(peer));
  const isConnectedToMultipleDevices = senderDevices.filter((device) => device.status === "connected").length > 1;
  const pairingString = signalId && encryptionKey ? `toolkit-sync:v1:${signalId}:${encryptionKey}` : "";

  const value = useMemo<SyncContextValue>(
    () => ({
      deviceId,
      deviceName,
      setDeviceName,
      saveDeviceName,
      syncPhase,
      p2pRole,
      signalId,
      encryptionKey,
      receiverDeviceId,
      receiverDeviceName,
      pairingString,
      manualPairingString,
      setManualPairingString,
      senderDevices,
      pendingSenderDevices,
      activeSenderDevices,
      connectionLogs,
      remoteOfferSdp,
      isManualEntry,
      isRefreshing,
      hasActiveConnection,
      isConnectedToMultipleDevices,
      startSync,
      startCamera,
      cleanupSync,
      handleScannedData,
      handleReject,
      handleReceiverApproval,
      handleSenderApproval,
      handleSenderReject,
      disconnectSenderDevice,
      requestManualSync,
    }),
    [
      cleanupSync,
      connectionLogs,
      deviceId,
      deviceName,
      disconnectSenderDevice,
      encryptionKey,
      handleReceiverApproval,
      handleReject,
      handleScannedData,
      handleSenderApproval,
      handleSenderReject,
      hasActiveConnection,
      isConnectedToMultipleDevices,
      isManualEntry,
      isRefreshing,
      manualPairingString,
      p2pRole,
      pairingString,
      pendingSenderDevices,
      receiverDeviceId,
      receiverDeviceName,
      remoteOfferSdp,
      requestManualSync,
      saveDeviceName,
      senderDevices,
      signalId,
      startCamera,
      startSync,
      syncPhase,
      activeSenderDevices,
    ],
  );

  return (
    <SyncContext.Provider value={value}>
      {children}
      {conflictState ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-xl rounded-[2rem] border border-zinc-800 bg-[#111113] p-6 shadow-2xl shadow-black/50">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">Sync Conflict</p>
                <h3 className="text-xl font-black uppercase italic tracking-wide text-white">Both devices changed</h3>
                <p className="text-sm text-zinc-400">
                  Choose which version should win for all synced data. This will replace saved local app data on the other side.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <button
                onClick={() => void resolveConflict("local")}
                className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-5 text-left transition hover:border-primary/60"
              >
                <div className="flex items-center gap-3">
                  <Laptop2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white">{deviceName}</p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Keep this device</p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-zinc-400">Use the data from the device that clicked refresh.</p>
              </button>

              <button
                onClick={() => void resolveConflict("remote")}
                className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-5 text-left transition hover:border-primary/60"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white">{conflictState.remoteDeviceName}</p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Use remote device</p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-zinc-400">Pull the saved data from the other connected device instead.</p>
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isRefreshing ? (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-950/90 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-300 shadow-lg shadow-black/30 backdrop-blur">
          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
          Syncing data
        </div>
      ) : hasActiveConnection ? (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-950/90 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-300 shadow-lg shadow-black/30 backdrop-blur">
          <CheckCircle2 className={cn("h-4 w-4", hasActiveConnection ? "text-green-400" : "text-zinc-500")} />
          {isConnectedToMultipleDevices ? "Multi-device sync ready" : "Sync ready"}
        </div>
      ) : null}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within SyncProvider");
  }
  return context;
}
