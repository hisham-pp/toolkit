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
import { AlertTriangle, CheckCircle2, Laptop2, RefreshCw, Smartphone, X } from "lucide-react";

import { RECENT_TOOLS_KEY } from "@/utility/constants/storage-keys";
import {
  RELAY_URL,
  SYNC_SESSION_META_KEY,
  SYNC_DEVICE_ID_KEY,
  SYNC_DEVICE_NAME_KEY,
  AUTO_RECONNECT_MAX_AGE_MS,
  SERVICE_DEFINITIONS,
  INTERNAL_SYNC_KEYS,
  PAIRING_RELAY_PREFIX,
} from "@/utility/constants/sync";
import { loadTodoWorkspace, saveTodoWorkspace } from "@/utility/helpers/todo-db";
import { compressData, decompressData } from "@/utility/helpers/sync";
import { cn } from "@/utility/helpers/utils";
import type {
  SyncPhase,
  SyncRole,
  SignalType,
  SenderDevice,
  SyncSnapshot,
  SyncRequestMessage,
  SyncResultMessage,
  PeerMessage,
  ConnectionState,
  PendingRequest,
  DifferingService,
  ConflictState,
  SyncContextValue,
} from "@/utility/types/sync";

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

function mergeRecentTools(localStr: string | null, remoteStr: string | null) {
  try {
    const local = localStr ? (JSON.parse(localStr) as string[]) : [];
    const remote = remoteStr ? (JSON.parse(remoteStr) as string[]) : [];
    const combined = Array.from(new Set([...local, ...remote]));
    return JSON.stringify(combined.slice(0, 20));
  } catch {
    return localStr || remoteStr || "[]";
  }
}

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

function makeOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
  const [pairingOtp, setPairingOtp] = useState("");
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
  const trustedDeviceIdsRef = useRef<Set<string>>(new Set());
  const isAutoReconnectingRef = useRef(false);
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
      if (Array.isArray(meta?.senderDevices)) {
        setSenderDevices(meta.senderDevices);
        meta.senderDevices.forEach((d: any) => {
          if (d.status === "connected") trustedDeviceIdsRef.current.add(d.id);
        });
      }
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

  const getServiceSummary = useCallback((snapshot: SyncSnapshot, serviceId: string) => {
    if (serviceId === "todos") {
      const count = snapshot.todos?.todos?.length || 0;
      const projects = snapshot.todos?.projects?.length || 0;
      return `${count} tasks, ${projects} projects`;
    }
    const def = SERVICE_DEFINITIONS.find((d) => d.id === serviceId);
    if (def) {
      const keysPresent = def.keys.filter((k) => k in snapshot.storage).length;
      return keysPresent > 0 ? `${keysPresent} settings saved` : "Empty";
    }
    return "Generic settings changed";
  }, []);

  const resolveGranularConflict = useCallback(async () => {
    if (!conflictState) return;

    const finalSnapshot: SyncSnapshot = {
      ...conflictState.localSnapshot,
      storage: { ...conflictState.localSnapshot.storage },
      todos: { ...conflictState.localSnapshot.todos },
    };

    conflictState.differingServices.forEach(service => {
      const choice = conflictState.resolutions[service.id];
      const source = choice === "local" ? conflictState.localSnapshot : conflictState.remoteSnapshot;
      
      if (service.isTodos) {
        finalSnapshot.todos = source.todos;
      } else if (service.id === "other") {
        const allKnownKeys = new Set<string>(SERVICE_DEFINITIONS.flatMap(s => s.keys as readonly string[]));
        allKnownKeys.add(RECENT_TOOLS_KEY);
        Object.entries(source.storage).forEach(([k, v]) => {
          if (!allKnownKeys.has(k)) finalSnapshot.storage[k] = v;
        });
      } else {
        service.keys.forEach(k => {
          if (k in source.storage) {
            finalSnapshot.storage[k] = source.storage[k];
          } else {
            delete finalSnapshot.storage[k];
          }
        });
      }
    });

    const finalHash = computeSyncHash(finalSnapshot);
    const targetPeer = p2pRole === "sender" 
      ? persistentSyncRuntime.senderPeers.get(conflictState.peerId)
      : persistentSyncRuntime.peer;

    if (targetPeer) {
      sendPeerMessage(targetPeer, {
        type: "FORCE_APPLY",
        requestId: conflictState.requestId,
        snapshot: finalSnapshot,
        snapshotHash: finalHash,
        originId: deviceId,
        originName: deviceName,
      });
      await applySnapshot(finalSnapshot);
      updateConnectionState(conflictState.peerId, {
        lastResolvedHash: finalHash,
        remoteDeviceName: conflictState.remoteDeviceName,
      });
      toast.success("Conflict resolved successfully");
    }

    persistentSyncRuntime.pendingRequests.delete(conflictState.requestId);
    setConflictState(null);
    setIsRefreshing(false);
  }, [conflictState, p2pRole, deviceId, deviceName, applySnapshot, updateConnectionState, computeSyncHash, sendPeerMessage]);

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
        const remoteSnapshot = message.snapshot;
        // Auto-merge non-critical keys
        const localTools = pending.localSnapshot.storage[RECENT_TOOLS_KEY];
        const remoteTools = remoteSnapshot.storage[RECENT_TOOLS_KEY];
        if (localTools !== remoteTools) {
          const merged = mergeRecentTools(localTools, remoteTools);
          pending.localSnapshot.storage[RECENT_TOOLS_KEY] = merged;
          remoteSnapshot.storage[RECENT_TOOLS_KEY] = merged;
        }

        const diffs: DifferingService[] = [];
        
        // Check Todos
        if (JSON.stringify(pending.localSnapshot.todos) !== JSON.stringify(remoteSnapshot.todos)) {
          diffs.push({
            id: "todos",
            name: "Todos & Projects",
            keys: [],
            isTodos: true,
            localSummary: getServiceSummary(pending.localSnapshot, "todos"),
            remoteSummary: getServiceSummary(remoteSnapshot, "todos"),
          });
        }

        // Check defined services
        SERVICE_DEFINITIONS.filter(s => s.id !== "todos").forEach(service => {
          const isDifferent = service.keys.some(k => 
            pending.localSnapshot.storage[k] !== remoteSnapshot.storage[k]
          );
          if (isDifferent) {
            diffs.push({
              ...service,
              localSummary: getServiceSummary(pending.localSnapshot, service.id),
              remoteSummary: getServiceSummary(remoteSnapshot, service.id),
            });
          }
        });

        // Check everything else (Other)
        const allKnownKeys = new Set<string>(SERVICE_DEFINITIONS.flatMap(s => s.keys as readonly string[]));
        allKnownKeys.add(RECENT_TOOLS_KEY);
        const localOther = Object.keys(pending.localSnapshot.storage).filter(k => !allKnownKeys.has(k));
        const remoteOther = Object.keys(remoteSnapshot.storage).filter(k => !allKnownKeys.has(k));
        const otherDifferent = Array.from(new Set([...localOther, ...remoteOther])).some(k => 
          pending.localSnapshot.storage[k] !== remoteSnapshot.storage[k]
        );

        if (otherDifferent) {
          diffs.push({
            id: "other",
            name: "Other Tool Settings",
            keys: [],
            localSummary: "Generic settings changed",
            remoteSummary: "Generic settings changed",
          });
        }

        if (diffs.length === 0) {
          // Re-sync after auto-merge
          setIsRefreshing(true);
          const finalHash = computeSyncHash(pending.localSnapshot);
          const targetPeer = p2pRole === "sender" 
            ? persistentSyncRuntime.senderPeers.get(pending.peerId)
            : persistentSyncRuntime.peer;
          
          if (targetPeer) {
            sendPeerMessage(targetPeer, {
              type: "FORCE_APPLY",
              requestId: message.requestId,
              snapshot: pending.localSnapshot,
              snapshotHash: finalHash,
              originId: deviceId,
              originName: deviceName,
            });
            updateConnectionState(pending.peerId, { lastResolvedHash: finalHash });
          }
          persistentSyncRuntime.pendingRequests.delete(message.requestId);
          setIsRefreshing(false);
          return;
        }

        setConflictState({
          requestId: message.requestId,
          peerId: pending.peerId,
          localSnapshot: pending.localSnapshot,
          localHash: pending.localHash,
          remoteSnapshot: remoteSnapshot,
          remoteHash: message.snapshotHash,
          remoteDeviceName: message.remoteDeviceName,
          differingServices: diffs,
          resolutions: Object.fromEntries(diffs.map(d => [d.id, "local"])),
        });
      }
    },
    [applySnapshot, updateConnectionState, computeSyncHash, deviceId, deviceName, p2pRole, sendPeerMessage, getServiceSummary],
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
        trustedDeviceIdsRef.current.add(targetReceiverId);
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
        const otp = makeOtp();
        setPairingOtp(otp);
        resumeSenderSession(sId, eKey, []);

        // Also listen on the OTP topic for pairing requests
        const otpListener = pollForSignal(
          `${PAIRING_RELAY_PREFIX}${otp}`,
          otp,
          ["JOIN"],
          ({ receiverId: tempReceiverId }) => {
            if (!tempReceiverId) return;
            // Send the real pairing details to the requester's temp topic
            sendSignal(tempReceiverId, otp, "ANSWER", {
              sdp: `toolkit-sync:v1:${sId}:${eKey}`,
            });
          },
        );

        // Chain the cleanup
        const originalCleanup = persistentSyncRuntime.signalListenerCleanup;
        persistentSyncRuntime.signalListenerCleanup = () => {
          if (originalCleanup) originalCleanup();
          otpListener();
        };
      }
    },
    [PeerConstructor, pollForSignal, resumeSenderSession, sendSignal],
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
      resumeReceiverSession(sId, eKey, deviceId || makeRandomHex(8), deviceName);
    },
    [deviceId, deviceName, resumeReceiverSession],
  );

  const connectWithOtp = useCallback(
    async (otp: string) => {
      if (otp.length !== 6) {
        toast.error("Please enter a 6-digit code");
        return;
      }

      const tempReceiverId = makeRandomHex(12);
      addLog(`Requesting pairing with code ${otp}...`);

      // Send the request
      sendSignal(`${PAIRING_RELAY_PREFIX}${otp}`, otp, "JOIN", { receiverId: tempReceiverId });

      // Listen for the response
      const cleanupTempListener = pollForSignal(tempReceiverId, otp, ["ANSWER"], ({ sdp }) => {
        if (sdp?.startsWith("toolkit-sync:v1:")) {
          addLog("Pairing details received, connecting...");
          handleScannedData(sdp);
          cleanupTempListener();
        }
      });
    },
    [addLog, handleScannedData, sendSignal, pollForSignal],
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

  useEffect(() => {
    if (!PeerConstructor || hasAutoReconnectAttemptedRef.current) return;

    const meta = restoredSessionRef.current;
    if (!meta?.signalId || !meta?.encryptionKey || !meta?.role || !meta?.savedAt) return;
    if (Date.now() - meta.savedAt > AUTO_RECONNECT_MAX_AGE_MS) return;
    if (meta.syncPhase === "idle") return;

    hasAutoReconnectAttemptedRef.current = true;
    isAutoReconnectingRef.current = true;

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

  // Auto-approve logic for re-connections
  useEffect(() => {
    if (p2pRole !== "sender") return;
    senderDevices.forEach((device) => {
      if (device.status === "awaiting_approval" && device.remoteSdp && trustedDeviceIdsRef.current.has(device.id)) {
        handleSenderApproval(device.id);
      }
    });
  }, [p2pRole, senderDevices, handleSenderApproval]);

  useEffect(() => {
    if (p2pRole === "receiver" && syncPhase === "confirming" && remoteOfferSdp && isAutoReconnectingRef.current) {
      handleReceiverApproval();
    }
  }, [p2pRole, syncPhase, remoteOfferSdp, handleReceiverApproval]);

  useEffect(() => {
    if (syncPhase === "connected" || syncPhase === "idle") {
      isAutoReconnectingRef.current = false;
    }
  }, [syncPhase]);

  const requestManualSync = useCallback(async () => {
    if (conflictState) {
      toast.error("Resolve the current sync conflict first");
      return;
    }

    const isActuallyConnected =
      (p2pRole === "sender" && senderDevices.some((d) => d.status === "connected")) ||
      (p2pRole === "receiver" && syncPhase === "connected" && !!peer);

    if (isActuallyConnected) {
      setIsRefreshing(true);
      const snapshot = await gatherSnapshot();
      const snapshotHash = computeSyncHash(snapshot);

      if (p2pRole === "sender") {
        const connected = senderDevices.filter((device) => device.status === "connected");
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
      } else if (p2pRole === "receiver" && peer) {
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
      }
      return;
    }

    const saved = localStorage.getItem(SYNC_SESSION_META_KEY);
    if (saved) {
      try {
        const meta = JSON.parse(saved);
        if (meta.signalId && meta.encryptionKey && meta.role) {
          toast.info("Reconnecting to sync session...");
          if (meta.role === "sender") {
            resumeSenderSession(meta.signalId, meta.encryptionKey, meta.senderDevices || []);
          } else if (meta.role === "receiver" && meta.receiverDeviceId) {
            resumeReceiverSession(meta.signalId, meta.encryptionKey, meta.receiverDeviceId, meta.receiverDeviceName);
          }
          
          setTimeout(() => {
            void requestManualSync();
          }, 3000);
          return;
        }
      } catch (e) {
        console.error("Auto-reconnect failed", e);
      }
    }

    toast.error("Please connect a device in Settings & Sync first");
  }, [
    conflictState,
    p2pRole,
    senderDevices,
    syncPhase,
    peer,
    gatherSnapshot,
    computeSyncHash,
    deviceId,
    deviceName,
    receiverDeviceId,
    sendPeerMessage,
    resumeSenderSession,
    resumeReceiverSession,
  ]);

  const updateConflictResolution = (serviceId: string, choice: "local" | "remote") => {
    setConflictState(prev => prev ? {
      ...prev,
      resolutions: { ...prev.resolutions, [serviceId]: choice }
    } : null);
  };

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
    setP2pRole("receiver");
    setSyncPhase("pairing");
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
      pairingOtp,
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
      connectWithOtp,
      handleReject,
      handleReceiverApproval,
      handleSenderApproval,
      handleSenderReject,
      disconnectSenderDevice,
      requestManualSync,
    }),
    [
      cleanupSync,
      connectWithOtp,
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
      pairingOtp,
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2.5rem] border border-zinc-800 bg-[#111113] p-8 shadow-2xl shadow-black/50">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-300">Sync Conflict Detected</p>
                  <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">Compare & Resolve</h3>
                  <p className="max-w-md text-sm text-zinc-400">
                    Both devices have changed since the last sync. Choose which version to keep for each service.
                  </p>
                </div>
              </div>
              <button onClick={cleanupSync} className="text-zinc-500 hover:text-white transition">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-8 space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {conflictState.differingServices.map((service) => (
                <div key={service.id} className="group rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 transition hover:border-zinc-700">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-lg font-black uppercase tracking-wide text-white italic">{service.name}</h4>
                      <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-widest">Select version to keep</p>
                    </div>
                    <div className="flex rounded-full bg-[#111113] p-1.5 border border-zinc-800 self-start md:self-auto">
                      <button
                        onClick={() => updateConflictResolution(service.id, "local")}
                        className={cn("px-5 py-2 text-[10px] font-black uppercase rounded-full transition-all duration-300", 
                          conflictState.resolutions[service.id] === "local" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-500 hover:text-zinc-300")}
                      >
                        Local
                      </button>
                      <button
                        onClick={() => updateConflictResolution(service.id, "remote")}
                        className={cn("px-5 py-2 text-[10px] font-black uppercase rounded-full transition-all duration-300", 
                          conflictState.resolutions[service.id] === "remote" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-500 hover:text-zinc-300")}
                      >
                        Remote
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      onClick={() => updateConflictResolution(service.id, "local")}
                      className={cn("cursor-pointer space-y-2 p-4 rounded-2xl border transition-all duration-300", 
                        conflictState.resolutions[service.id] === "local" 
                          ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20" 
                          : "bg-zinc-900/50 border-zinc-800/50 opacity-40 hover:opacity-60 grayscale")}
                    >
                      <div className="flex items-center gap-2">
                        <Laptop2 className="h-4 w-4 text-primary" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">On {deviceName}</p>
                      </div>
                      <p className="text-sm font-medium text-zinc-200">{service.localSummary}</p>
                    </div>

                    <div 
                      onClick={() => updateConflictResolution(service.id, "remote")}
                      className={cn("cursor-pointer space-y-2 p-4 rounded-2xl border transition-all duration-300", 
                        conflictState.resolutions[service.id] === "remote" 
                          ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20" 
                          : "bg-zinc-900/50 border-zinc-800/50 opacity-40 hover:opacity-60 grayscale")}
                    >
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-primary" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">On {conflictState.remoteDeviceName}</p>
                      </div>
                      <p className="text-sm font-medium text-zinc-200">{service.remoteSummary}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col md:flex-row gap-4">
              <button
                onClick={resolveGranularConflict}
                className="flex-1 rounded-full bg-primary px-8 py-4 text-xs font-black uppercase tracking-[0.3em] text-white transition hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20"
              >
                Apply Selected Changes
              </button>
              <button
                onClick={cleanupSync}
                className="rounded-full border border-zinc-800 bg-zinc-900/50 px-8 py-4 text-xs font-black uppercase tracking-[0.3em] text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                Cancel Sync
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
