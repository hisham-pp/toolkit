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
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

// Polyfills for simple-peer in Next.js/Browser
if (typeof window !== "undefined") {
  (window as any).global = window;
  (window as any).Buffer = (window as any).Buffer || require("buffer").Buffer;
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

type SyncPhase = "idle" | "role_select" | "offer" | "answer" | "connecting" | "connected" | "error";

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
  const [peer, setPeer] = useState<any>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isManual, setIsManual] = useState(false);

  const cleanupSync = useCallback(() => {
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    setSyncPhase("idle");
    setP2pRole(null);
    setLocalSdp("");
    setRemoteSdp("");
    setIsManual(false);
  }, [peer]);

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

  const initSender = () => {
    if (!PeerConstructor) return;
    setP2pRole("sender");
    setSyncPhase("offer");
    
    const newPeer = new PeerConstructor({ initiator: true, trickle: false });
    
    newPeer.on("signal", (data: any) => {
      setLocalSdp(JSON.stringify(data));
    });

    newPeer.on("connect", async () => {
      setSyncPhase("connected");
      const allData = await gatherAllData();
      newPeer.send(JSON.stringify({ type: "FULL_SYNC", payload: allData }));
      toast.success("Sync successful! All data sent.");
    });

    newPeer.on("error", (err: any) => {
      console.error("P2P Error:", err);
      setSyncPhase("error");
    });

    setPeer(newPeer);
  };

  const initReceiver = () => {
    setP2pRole("receiver");
    setSyncPhase("offer");
  };

  const handleManualOfferSubmit = () => {
    if (!remoteSdp || !PeerConstructor) return;
    
    if (p2pRole === "receiver") {
      // Create peer and signal the offer
      try {
        const offer = JSON.parse(remoteSdp);
        const newPeer = new PeerConstructor({ initiator: false, trickle: false });
        
        newPeer.on("signal", (data: any) => {
          setLocalSdp(JSON.stringify(data));
          setSyncPhase("answer");
        });

        newPeer.on("connect", () => {
          setSyncPhase("connected");
          toast.success("Connected! Receiving data...");
        });

        newPeer.on("data", async (data: any) => {
          const msg = JSON.parse(data.toString());
          if (msg.type === "FULL_SYNC") {
            await mergeData(msg.payload);
            toast.success("Sync complete! Your toolkit is updated.");
            cleanupSync();
          }
        });

        newPeer.on("error", (err: any) => {
          console.error("P2P Error:", err);
          setSyncPhase("error");
        });

        newPeer.signal(offer);
        setPeer(newPeer);
      } catch (e) {
        toast.error("Invalid offer code");
      }
    } else if (p2pRole === "sender") {
      // Signal the answer
      if (!peer) return;
      try {
        peer.signal(JSON.parse(remoteSdp));
        setSyncPhase("connecting");
      } catch (e) {
        toast.error("Invalid answer code");
      }
    }
  };

  const startScanner = (onScan: (data: string) => void) => {
    setIsManual(false);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
      scanner.render((text) => {
        onScan(text);
        scanner.clear().catch(console.error);
        scannerRef.current = null;
      }, (err) => {});
      scannerRef.current = scanner;
    }, 100);
  };

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
          <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-primary shadow-inner">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-widest text-white italic">P2P Synchronizer</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">No Cloud • No Server • Direct Peer-to-Peer</p>
          </div>
        </div>

        <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-8">
          {syncPhase === "idle" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-8 text-center">
              <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-[2rem] flex items-center justify-center text-zinc-700">
                <Database className="w-10 h-10" />
              </div>
              <div className="max-w-md space-y-3">
                <h3 className="text-xl font-black text-white uppercase italic tracking-widest">Sync Your Workspace</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                  Transfer your 2FA accounts, server configurations, and task lists directly between devices using WebRTC.
                </p>
              </div>
              <div className="flex gap-4 w-full max-w-sm">
                <Button 
                  onClick={initSender}
                  className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest"
                >
                  Send Data
                </Button>
                <Button 
                  onClick={initReceiver}
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  Receive Data
                </Button>
              </div>
            </div>
          )}

          {syncPhase !== "idle" && (
            <div className="space-y-8 relative">
              <button 
                onClick={cleanupSync}
                className="absolute -top-4 -right-4 p-2 text-zinc-600 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  syncPhase === "connected" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                )}>
                  {syncPhase === "connected" ? <CheckCircle2 className="w-6 h-6" /> : <RefreshCw className="w-6 h-6 animate-spin" />}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase tracking-widest text-white italic">
                    {p2pRole === "sender" ? "Sending Workspace" : "Receiving Workspace"}
                  </h4>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    Phase: {syncPhase.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Local SDP View (Offer/Answer) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      {p2pRole === "sender" ? (syncPhase === "offer" ? "Your Offer" : "Waiting for Answer") : (syncPhase === "answer" ? "Your Answer" : "Scan Offer First")}
                    </span>
                    <button 
                      onClick={() => setIsManual(!isManual)}
                      className="text-[9px] font-bold text-primary uppercase tracking-widest hover:underline"
                    >
                      {isManual ? "Switch to QR" : "Show Manual Code"}
                    </button>
                  </div>

                  {localSdp ? (
                    isManual ? (
                      <div className="space-y-4">
                        <M3Textarea 
                          readOnly
                          value={localSdp}
                          rows={6}
                          className="font-mono text-[10px] bg-zinc-950 border-zinc-900 rounded-2xl"
                        />
                        <Button 
                          onClick={() => {
                            navigator.clipboard.writeText(localSdp);
                            toast.success("Code copied!");
                          }}
                          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 h-10 rounded-xl text-[10px] uppercase font-black tracking-widest"
                        >
                          <Copy className="w-4 h-4 mr-2" /> Copy Manual Code
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-white p-6 rounded-3xl flex items-center justify-center aspect-square max-w-[280px] mx-auto">
                        <QRCodeSVG value={localSdp} size={240} level="L" />
                      </div>
                    )
                  ) : (
                    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl aspect-square flex items-center justify-center max-w-[280px] mx-auto">
                      <p className="text-[10px] font-black text-zinc-800 uppercase italic">Generating...</p>
                    </div>
                  )}
                </div>

                {/* Remote SDP Input (Scan/Paste) */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    {p2pRole === "sender" ? "Step 2: Scan/Paste Remote Answer" : "Step 1: Scan/Paste Remote Offer"}
                  </span>
                  
                  {isManual ? (
                    <div className="space-y-4">
                      <M3Textarea 
                        placeholder="Paste code from other device..."
                        value={remoteSdp}
                        onChange={(e) => setRemoteSdp(e.target.value)}
                        rows={6}
                        className="font-mono text-[10px] bg-zinc-950 border-zinc-900 rounded-2xl"
                      />
                      <Button 
                        onClick={handleManualOfferSubmit}
                        disabled={!remoteSdp}
                        className="w-full bg-primary text-white h-10 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-lg shadow-primary/20"
                      >
                        {p2pRole === "sender" ? "Connect" : "Generate Answer"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div 
                        id="qr-reader" 
                        className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 aspect-square flex items-center justify-center max-w-[280px] mx-auto"
                      >
                        <Button 
                          onClick={() => {
                            startScanner((data) => {
                              setRemoteSdp(data);
                              if (p2pRole === "receiver") {
                                // For receiver, we need to create the peer first
                                if (!PeerConstructor) return;
                                try {
                                  const offer = JSON.parse(data);
                                  const newPeer = new PeerConstructor({ initiator: false, trickle: false });
                                  
                                  newPeer.on("signal", (ansData: any) => {
                                    setLocalSdp(JSON.stringify(ansData));
                                    setSyncPhase("answer");
                                  });

                                  newPeer.on("connect", () => {
                                    setSyncPhase("connected");
                                    toast.success("Connected! Receiving data...");
                                  });

                                  newPeer.on("data", async (msgData: any) => {
                                    const msg = JSON.parse(msgData.toString());
                                    if (msg.type === "FULL_SYNC") {
                                      await mergeData(msg.payload);
                                      toast.success("Sync complete! Your toolkit is updated.");
                                      cleanupSync();
                                    }
                                  });

                                  newPeer.on("error", (err: any) => {
                                    console.error("P2P Error:", err);
                                    setSyncPhase("error");
                                  });

                                  newPeer.signal(offer);
                                  setPeer(newPeer);
                                } catch (e) { toast.error("Invalid offer code"); }
                              } else if (p2pRole === "sender" && peer) {
                                try {
                                  peer.signal(JSON.parse(data));
                                  setSyncPhase("connecting");
                                } catch (e) { toast.error("Invalid answer code"); }
                              }
                            });
                          }}
                          className="bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white rounded-2xl p-6 flex flex-col items-center gap-4"
                        >
                          <Scan className="w-8 h-8" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Start Scanner</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 hover:opacity-100 transition-opacity">
         {[
           { icon: Shield, title: "Zero Server", desc: "Data never touches any cloud" },
           { icon: Terminal, title: "WebRTC P2P", desc: "Direct browser-to-browser sync" },
           { icon: ShieldCheck, title: "Local Encryption", desc: "Encrypted before transmission" }
         ].map((feat, i) => (
           <div key={i} className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem] space-y-3">
              <feat.icon className="w-5 h-5 text-primary" />
              <h5 className="text-[10px] font-black uppercase text-white tracking-widest">{feat.title}</h5>
              <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest leading-relaxed">{feat.desc}</p>
           </div>
         ))}
      </section>
    </div>
  );
}
