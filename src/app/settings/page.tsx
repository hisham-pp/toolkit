"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  QrCode, 
  Scan, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Shield,
  ArrowRightLeft,
  X,
  ShieldCheck,
  Terminal,
  Settings as SettingsIcon,
  ChevronRight,
  Monitor,
  Lock,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import CryptoJS from "crypto-js";

// Polyfills for simple-peer in Next.js/Browser
if (typeof window !== "undefined") {
  (window as any).global = window;
  (window as any).Buffer = (window as any).Buffer || require("buffer").Buffer;
  (window as any).process = (window as any).process || { 
    env: {}, 
    nextTick: (fn: any) => setTimeout(fn, 0),
    browser: true 
  };
}

import { Button } from "@/components/ui/button";
import { M3Input, M3Textarea } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { cn } from "@/utility/helpers/utils";
import { 
  AUTHENTICATOR_DATA_KEY, 
  SSH_CONFIGS_KEY, 
  RECENT_TOOLS_KEY, 
  SSH_VAULT_KEY 
} from "@/utility/constants/storage-keys";
import { loadTodoWorkspace, saveTodoWorkspace } from "@/utility/helpers/todo-db";
import { obfuscate, deobfuscate } from "@/utility/helpers/otp";
import { compressData, decompressData } from "@/utility/helpers/sync";

type SyncPhase = "idle" | "pairing" | "connecting" | "confirming" | "connected" | "error";
const RELAY_URL = "https://ntfy.sh";

export default function SettingsPage() {
  const [PeerConstructor, setPeerConstructor] = useState<any>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("simple-peer").then(m => {
        setPeerConstructor(() => m.default);
      });
    }
  }, []);

  const [syncPhase, setSyncPhase] = useState<SyncPhase>("idle");
  const [p2pRole, setP2pRole] = useState<"sender" | "receiver" | null>(null);
  const [localSdp, setLocalSdp] = useState("");
  const [remoteSdp, setRemoteSdp] = useState("");
  const [manualPairingString, setManualPairingString] = useState("");
  const [peer, setPeer] = useState<any>(null);
  const [isManual, setIsManual] = useState(false);
  
  // New relay-based sync states
  const [signalId, setSignalId] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerAlignTimeoutRef = useRef<number | null>(null);
  const [pendingApproval, setPendingApproval] = useState(false);
  
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const addLog = useCallback((msg: string) => {
    console.log(`[P2P Sync] ${msg}`);
    setConnectionLogs(prev => [...prev.slice(-4), msg]);
  }, []);

  const cleanupSync = useCallback(() => {
    addLog("Cleaning up sync session...");
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    if (html5QrCodeRef.current) {
      if (html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
      html5QrCodeRef.current = null;
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (scannerAlignTimeoutRef.current !== null) {
      window.clearTimeout(scannerAlignTimeoutRef.current);
      scannerAlignTimeoutRef.current = null;
    }
    setSyncPhase("idle");
    setP2pRole(null);
    setLocalSdp("");
    setRemoteSdp("");
    setManualPairingString("");
    setSignalId("");
    setEncryptionKey("");
    setIsManual(false);
    setPendingApproval(false);
  }, [peer]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (html5QrCodeRef.current?.isScanning) html5QrCodeRef.current.stop();
      if (scannerAlignTimeoutRef.current !== null) {
        window.clearTimeout(scannerAlignTimeoutRef.current);
      }
    };
  }, []);

  const gatherAllData = async () => {
    const storage: Record<string, string | null> = {};
    [RECENT_TOOLS_KEY, AUTHENTICATOR_DATA_KEY, SSH_CONFIGS_KEY, SSH_VAULT_KEY].forEach(key => {
      storage[key] = localStorage.getItem(key);
    });
    const todos = await loadTodoWorkspace();
    return { storage, todos };
  };

  const mergeData = async (payload: any) => {
    const { storage, todos } = payload;

    // 1. Merge localStorage items
    if (storage) {
      // 2FA Data
      if (storage[AUTHENTICATOR_DATA_KEY]) {
        const local2fa = localStorage.getItem(AUTHENTICATOR_DATA_KEY);
        const remoteRaw = storage[AUTHENTICATOR_DATA_KEY];
        
        try {
          const remoteParsed = JSON.parse(deobfuscate(remoteRaw) || "[]");
          const localParsed = JSON.parse(deobfuscate(local2fa || "") || "[]");
          
          const localMap = new Map(localParsed.map((a: any) => [a.id, a]));
          remoteParsed.forEach((a: any) => {
            if (!localMap.has(a.id)) localMap.set(a.id, a);
          });
          
          localStorage.setItem(AUTHENTICATOR_DATA_KEY, obfuscate(JSON.stringify(Array.from(localMap.values()))));
        } catch (e) { console.error("2FA Merge Error", e); }
      }

      // SSH Configs
      if (storage[SSH_CONFIGS_KEY]) {
        try {
          const remote = JSON.parse(storage[SSH_CONFIGS_KEY]);
          const local = JSON.parse(localStorage.getItem(SSH_CONFIGS_KEY) || "[]");
          const localMap = new Map(local.map((s: any) => [s.id, s]));
          remote.forEach((s: any) => {
            if (!localMap.has(s.id)) localMap.set(s.id, s);
          });
          localStorage.setItem(SSH_CONFIGS_KEY, JSON.stringify(Array.from(localMap.values())));
        } catch (e) { console.error("SSH Merge Error", e); }
      }

      // Recent Tools
      if (storage[RECENT_TOOLS_KEY]) {
        try {
          const remote = JSON.parse(storage[RECENT_TOOLS_KEY]);
          const local = JSON.parse(localStorage.getItem(RECENT_TOOLS_KEY) || "[]");
          const merged = Array.from(new Set([...local, ...remote])).slice(0, 10);
          localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(merged));
        } catch (e) { console.error("Recent Tools Merge Error", e); }
      }
      
      // SSH Vault Key (If not already set)
      if (storage[SSH_VAULT_KEY] && !localStorage.getItem(SSH_VAULT_KEY)) {
        localStorage.setItem(SSH_VAULT_KEY, storage[SSH_VAULT_KEY]);
      }
    }

    // 2. Merge Todos
    if (todos) {
      try {
        const local = await loadTodoWorkspace();
        
        // Merge projects
        const projectMap = new Map(local.projects.map(p => [p.id, p]));
        todos.projects.forEach((p: any) => {
          if (!projectMap.has(p.id)) projectMap.set(p.id, p);
        });

        // Merge todos
        const todoMap = new Map(local.todos.map(t => [t.id, t]));
        todos.todos.forEach((t: any) => {
          if (!todoMap.has(t.id)) todoMap.set(t.id, t);
        });

        await saveTodoWorkspace({
          projects: Array.from(projectMap.values()),
          todos: Array.from(todoMap.values())
        });
      } catch (e) { console.error("Todo Merge Error", e); }
    }
  };

  const sendSignal = async (id: string, key: string, type: "OFFER" | "ANSWER" | "APPROVE" | "REJECT", sdp?: string) => {
    try {
      const payload = { type, sdp: sdp ? compressData(sdp) : undefined };
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key).toString();
      await fetch(`${RELAY_URL}/${id}`, {
        method: "POST",
        body: encrypted,
        headers: { "Title": "Toolkit Sync" }
      });
    } catch (e) {
      console.error("Signal Send Error", e);
    }
  };

  const pollForSignal = (id: string, key: string, targetTypes: ("OFFER" | "ANSWER" | "APPROVE" | "REJECT")[], onSignal: (type: string, sdp?: string) => void) => {
    addLog(`Starting real-time signal listener for: ${targetTypes.join(", ")}`);
    const seenIds = new Set<string>();

    const parseCachedMessages = (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return [];

      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
        return [parsed];
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
          .filter((msg): msg is Record<string, any> => Boolean(msg));
      }
    };

    const processMessage = (msg: any) => {
      if (seenIds.has(msg.id)) return;
      seenIds.add(msg.id);

      const encryptedData = msg.message || msg.body;
      if (!encryptedData || typeof encryptedData !== "string") return;
      
      try {
        addLog("Attempting to decrypt incoming signal...");
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedStr) {
          addLog("Decryption failed (Wrong key or invalid data)");
          return;
        }
        
        const decrypted = JSON.parse(decryptedStr);
        addLog(`Received signal: ${decrypted.type}`);
        
        if (targetTypes.includes(decrypted.type)) {
          const sdp = decrypted.sdp ? decompressData(decrypted.sdp) : undefined;
          onSignal(decrypted.type, sdp);
        } else {
          addLog(`Ignoring ${decrypted.type} signal (Waiting for ${targetTypes.join("/")})`);
        }
      } catch (e) {
        addLog("Error processing message");
      }
    };

    // 1. Initial poll to catch missed messages
    const checkOnce = async () => {
      try {
        addLog("Checking for cached signals...");
        const resp = await fetch(`${RELAY_URL}/${id}/json?poll=1`);
        const raw = await resp.text();
        const messages = parseCachedMessages(raw);
        if (messages.length > 0) {
          addLog(`Found ${messages.length} cached messages`);
          messages.forEach(processMessage);
        }
      } catch (e) {
        addLog("Failed to fetch cached signals");
      }
    };

    checkOnce();

    // 2. Use EventSource for real-time
    addLog("Opening SSE connection to relay...");
    const es = new EventSource(`${RELAY_URL}/${id}/sse`);
    es.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        processMessage(msg);
      } catch (e) {}
    };

    es.onerror = () => {
      addLog("SSE connection error. Still polling...");
    };

    return () => {
      addLog("Closing signal listener.");
      es.close();
    };
  };

  const startSync = async (role: "sender" | "receiver") => {
    if (!PeerConstructor) {
      toast.error("P2P library not loaded. Please refresh.");
      return;
    }

    addLog(`Initializing ${role} role...`);
    setP2pRole(role);
    setSyncPhase("pairing");

    // Generate pairing credentials
    const sId = Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    const eKey = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    
    setSignalId(sId);
    setEncryptionKey(eKey);

    const peerOptions = { 
      initiator: role === "sender", 
      trickle: false,
      config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }
    };

    if (role === "sender") {
      addLog("Creating peer connection...");
      const newPeer = new PeerConstructor(peerOptions);
      let cleanup: (() => void) | null = null;
      
      newPeer.on("signal", (data: any) => {
        addLog("Local offer generated. Sending to relay...");
        const sdpStr = JSON.stringify(data);
        setLocalSdp(sdpStr);
        sendSignal(sId, eKey, "OFFER", sdpStr);
      });

      newPeer.on("connect", async () => {
        addLog("P2P connection established!");
        setSyncPhase("connected");
        const allData = await gatherAllData();
        newPeer.send(JSON.stringify({ type: "FULL_SYNC", payload: allData }));
        toast.success("Sync successful!");
      });

      newPeer.on("error", (err: any) => {
        addLog(`P2P Error: ${err.message || err}`);
        setSyncPhase("error");
      });

      setPeer(newPeer);

      // Poll for answer or rejection
      cleanup = pollForSignal(sId, eKey, ["ANSWER", "REJECT"], (type, sdp) => {
        if (type === "REJECT") {
          toast.error("Rejected by other device");
          cleanupSync();
          if (cleanup) cleanup();
          return;
        }
        
        // When we get an answer, we move to confirming phase
        setSyncPhase("confirming");
        setRemoteSdp(sdp!);
        if (cleanup) cleanup();
      });
    }
  };

  const handleSenderApproval = () => {
    if (!peer || !remoteSdp || !signalId || !encryptionKey) return;
    addLog("Approval granted. Connecting to remote device...");
    setSyncPhase("connecting");
    sendSignal(signalId, encryptionKey, "APPROVE");
    peer.signal(JSON.parse(remoteSdp));
  };

  const handleReceiverApproval = (offerSdp: string, sId: string, eKey: string) => {
    if (!offerSdp) {
      toast.error("Waiting for the laptop offer. Scan again or wait a moment.");
      return;
    }

    addLog("Approval granted. Initializing P2P connection...");
    const peerOptions = { 
      initiator: false, 
      trickle: false,
      config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }
    };
    const newPeer = new PeerConstructor(peerOptions);
    let cleanupListener: (() => void) | null = null;
    
    newPeer.on("signal", (ansData: any) => {
      addLog("Local response generated. Sending to relay...");
      const ansSdpStr = JSON.stringify(ansData);
      setLocalSdp(ansSdpStr);
      sendSignal(sId, eKey, "ANSWER", ansSdpStr);
      
      setSyncPhase("connecting");
      cleanupListener = pollForSignal(sId, eKey, ["APPROVE", "REJECT"], (type) => {
        if (type === "REJECT") {
          addLog("Connection rejected by other device.");
          cleanupSync();
        } else if (type === "APPROVE") {
          addLog("Connection approved! Receiving data...");
          setSyncPhase("connected");
        }
        if (cleanupListener) cleanupListener();
      });
    });

    newPeer.on("data", async (msgData: any) => {
      const msg = JSON.parse(msgData.toString());
      if (msg.type === "FULL_SYNC") {
        addLog("Sync data received. Merging...");
        await mergeData(msg.payload);
        toast.success("Sync complete!");
        cleanupSync();
      }
    });

    newPeer.on("error", (err: any) => {
      addLog(`P2P Error: ${err.message || err}`);
      setSyncPhase("error");
    });

    try {
      newPeer.signal(JSON.parse(offerSdp));
    } catch (err) {
      console.error("Invalid offer SDP", err);
      toast.error("Invalid connection offer. Please rescan the QR code.");
      cleanupSync();
      return;
    }

    setPeer(newPeer);
  };

  const handleScannedData = (data: string) => {
    if (!data.startsWith("toolkit-sync:v1:")) {
      toast.error("Invalid sync QR code");
      return;
    }

    addLog("QR code parsed. Waiting for connection offer...");
    const [, , sId, eKey] = data.split(":");
    setSignalId(sId);
    setEncryptionKey(eKey);
    setSyncPhase("connecting");

    pollForSignal(sId, eKey, ["OFFER", "REJECT"], (type, offerSdp) => {
      if (type === "REJECT") {
        addLog("Sync session was rejected.");
        cleanupSync();
        return;
      }
      addLog("Offer received from source device.");
      setRemoteSdp(offerSdp!);
      setSyncPhase("confirming");
    });
  };

  const handleReject = () => {
    if (signalId && encryptionKey) {
      sendSignal(signalId, encryptionKey, "REJECT");
    }
    toast.error("Connection rejected");
    cleanupSync();
  };

  const alignScannerPreview = () => {
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
      video.style.display = "block";
      video.setAttribute("playsinline", "true");
    }

    const shadedRegion = reader.querySelector("#qr-shaded-region") as HTMLDivElement | null;
    if (shadedRegion) {
      shadedRegion.style.inset = "0";
      shadedRegion.style.position = "absolute";
    }
  };

  const scheduleScannerAlignment = (attempt = 0) => {
    alignScannerPreview();
    if (attempt >= 24) {
      scannerAlignTimeoutRef.current = null;
      return;
    }
    scannerAlignTimeoutRef.current = window.setTimeout(() => {
      scheduleScannerAlignment(attempt + 1);
    }, 120);
  };

  const startCamera = async () => {
    setIsManual(false);
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const size = Math.max(180, Math.min(viewfinderWidth, viewfinderHeight) * 0.72);
            return {
              width: Math.floor(size),
              height: Math.floor(size),
            };
          },
        },
        (decodedText) => {
          handleScannedData(decodedText);
          html5QrCode.stop().catch(console.error);
        },
        () => {}
      );

      scheduleScannerAlignment();
    } catch (err) {
      console.error("Camera error", err);
      toast.error("Could not open camera. Try manual entry.");
      setIsManual(true);
    }
  };

  const pairingString = `toolkit-sync:v1:${signalId}:${encryptionKey}`;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <section className="space-y-6">
        <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
          <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-primary shadow-inner">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-widest text-white italic">P2P Synchronizer</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Secure • One-Way Scan • Zero Cloud</p>
          </div>
        </div>

        <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden relative">
          <AnimatePresence mode="wait">
            {syncPhase === "idle" && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center py-12 space-y-10 text-center"
              >
                <div className="relative">
                  <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] flex items-center justify-center text-zinc-700 shadow-inner">
                    <Database className="w-12 h-12" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white animate-bounce shadow-lg shadow-primary/20">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="max-w-md space-y-4">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-widest">Sync Your Devices</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                    Move your 2FA accounts and settings between any two devices securely.
                    No account needed. No data stored on servers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                  <button 
                    onClick={() => startSync("sender")}
                    className="group relative flex flex-col items-center gap-4 p-8 bg-zinc-950 border border-zinc-900 rounded-[2rem] hover:border-primary/50 transition-all overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Monitor className="w-8 h-8 text-primary" />
                    <div className="text-center">
                      <span className="block text-xs font-black text-white uppercase tracking-widest">Show Pairing Code</span>
                      <span className="text-[10px] text-zinc-600 font-bold uppercase">Use this device as source</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => { setP2pRole("receiver"); setSyncPhase("pairing"); }}
                    className="group relative flex flex-col items-center gap-4 p-8 bg-zinc-950 border border-zinc-900 rounded-[2rem] hover:border-primary/50 transition-all overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Scan className="w-8 h-8 text-primary" />
                    <div className="text-center">
                      <span className="block text-xs font-black text-white uppercase tracking-widest">Scan Or Paste Code</span>
                      <span className="text-[10px] text-zinc-600 font-bold uppercase">Use this device as destination</span>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {syncPhase !== "idle" && (
              <motion.div 
                key="active"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-8"
              >
                {/* Connection Status Log */}
                {connectionLogs.length > 0 && (
                  <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Live Status Log</span>
                    </div>
                    {connectionLogs.map((log, i) => (
                      <p key={i} className="text-[10px] font-mono text-zinc-400 break-all leading-tight">
                        <span className="text-zinc-700 mr-2">›</span>{log}
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                      syncPhase === "connected" ? "bg-green-500/20 text-green-500" : "bg-primary/10 text-primary"
                    )}>
                      {syncPhase === "connected" ? <CheckCircle2 className="w-6 h-6" /> : <RefreshCw className="w-6 h-6 animate-spin" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-white italic">
                        {p2pRole === "sender" ? "Sharing from this device" : "Receiving on this device"}
                      </h4>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                        Status: <span className="text-primary">{syncPhase.replace("_", " ")}</span>
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={cleanupSync}
                    className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  {syncPhase === "confirming" ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 space-y-8 text-center bg-zinc-950 border border-zinc-900 rounded-[3rem]">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-pulse">
                        <ShieldCheck className="w-10 h-10" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-xl font-black text-white uppercase italic tracking-widest">Confirm Connection</h3>
                        <p className="text-sm text-zinc-500 max-w-sm font-medium">
                          A device is requesting to {p2pRole === "sender" ? "receive your data" : "send you data"}. Do you want to proceed?
                        </p>
                      </div>
                      <div className="flex gap-4 w-full max-w-sm">
                        <Button 
                          onClick={() => {
                            if (p2pRole === "sender") handleSenderApproval();
                            else handleReceiverApproval(remoteSdp, signalId, encryptionKey);
                          }}
                          disabled={p2pRole === "receiver" && !remoteSdp}
                          className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                          Accept
                        </Button>
                        <Button 
                          onClick={handleReject}
                          variant="outline"
                          className="flex-1 h-14 rounded-2xl border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-red-500 transition-all"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ) : p2pRole === "sender" ? (
                    <>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Step 1: Scan this QR</h5>
                          <p className="text-xs text-zinc-400 font-medium">Open this same page on the other device and choose &quot;Scan Or Paste Code&quot;.</p>
                        </div>
                        
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl flex items-center justify-center aspect-square max-w-[320px] mx-auto group relative">
                          {signalId ? (
                            <QRCodeSVG value={pairingString} size={260} level="M" />
                          ) : (
                            <div className="text-zinc-300 animate-pulse">Initializing...</div>
                          )}
                          <div className="absolute inset-0 border-8 border-white rounded-[2.5rem] pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                          <div className="flex items-center gap-3">
                            <Lock className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">End-to-End Encrypted</span>
                          </div>
                          <p className="text-[10px] text-zinc-600 font-bold uppercase leading-relaxed">
                            A secure temporary channel has been created. Once the other device scans or pastes this code, you will be asked to approve the connection.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <button 
                            onClick={() => setIsManual(!isManual)}
                            className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                          >
                            {isManual ? "Hide manual code" : "Can't scan? Use manual code"}
                          </button>

                          {isManual && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                              <M3Textarea 
                                readOnly
                                value={pairingString}
                                rows={3}
                                className="font-mono text-[10px] bg-zinc-950 border-zinc-900 rounded-2xl"
                              />
                              <Button 
                                onClick={() => {
                                  navigator.clipboard.writeText(pairingString);
                                  toast.success("Copied!");
                                }}
                                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
                              >
                                <Copy className="w-4 h-4 mr-2" /> Copy Pairing String
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Step 1: Scan Or Paste Code</h5>
                          <p className="text-xs text-zinc-400 font-medium">Scan the QR code shown on the other device, or paste its pairing string manually.</p>
                        </div>

                        <div className="relative aspect-square w-full max-w-[320px] mx-auto rounded-[2.5rem] overflow-hidden border-2 border-dashed border-zinc-800 bg-zinc-950 flex items-center justify-center">
                           <div id="qr-reader" className="absolute inset-0 h-full w-full" />
                           {syncPhase === "pairing" && (
                              <Button 
                                onClick={startCamera}
                                className="relative z-10 h-20 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest flex flex-col items-center gap-2 shadow-xl shadow-primary/20"
                              >
                                <Scan className="w-8 h-8" />
                                <span>Start Camera</span>
                              </Button>
                           )}
                           {syncPhase === "connecting" && (
                              <div className="text-center space-y-4 relative z-10 bg-zinc-950/80 backdrop-blur-md p-8 rounded-3xl border border-zinc-800">
                                <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto" />
                                <p className="text-xs font-black text-white uppercase tracking-widest italic">Establishing Link...</p>
                              </div>
                           )}
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                           <div className="flex items-center gap-3">
                             <Zap className="w-4 h-4 text-amber-500" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-white">Any Device Pairing</span>
                           </div>
                           <p className="text-[10px] text-zinc-600 font-bold uppercase leading-relaxed">
                             This works for laptop-to-laptop, mobile-to-laptop, or mobile-to-mobile. One device shows the pairing code, the other scans it or pastes it.
                           </p>
                        </div>

                        <div className="space-y-4">
                           <button 
                             onClick={() => setIsManual(!isManual)}
                             className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                           >
                             {isManual ? "Back to scanner" : "Use manual pairing string"}
                           </button>

                           {isManual && (
                              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                <M3Textarea 
                                  placeholder="Paste pairing string from other device..."
                                  value={manualPairingString}
                                  onChange={(e) => {
                                    setManualPairingString(e.target.value);
                                    if (e.target.value.startsWith("toolkit-sync:v1:")) {
                                      handleScannedData(e.target.value);
                                    }
                                  }}
                                  rows={3}
                                  className="font-mono text-[10px] bg-zinc-950 border-zinc-900 rounded-2xl"
                                />
                              </div>
                           )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { icon: Shield, title: "Zero Server", desc: "Your data stays in the P2P tunnel" },
           { icon: Terminal, title: "E2E Encrypted", desc: "Signals are encrypted with a random key" },
           { icon: ShieldCheck, title: "Private", desc: "No logs, no storage, no accounts" }
         ].map((feat, i) => (
           <div key={i} className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] space-y-4 hover:border-zinc-700 transition-colors group">
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-primary transition-colors">
                <feat.icon className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-[10px] font-black uppercase text-white tracking-widest mb-1">{feat.title}</h5>
                <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest leading-relaxed">{feat.desc}</p>
              </div>
           </div>
         ))}
      </section>
    </div>
  );
}
