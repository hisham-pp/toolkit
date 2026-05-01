"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Trash2, 
  Copy, 
  ShieldCheck, 
  Search, 
  Key, 
  User, 
  Building2,
  Clock3,
  RefreshCw,
  MoreVertical,
  X,
  Download,
  Upload,
  Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Input } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { cn } from "@/utility/helpers/utils";
import { generateTOTP, obfuscate, deobfuscate } from "@/utility/helpers/otp";
import { AUTHENTICATOR_DATA_KEY } from "@/utility/constants/storage-keys";

interface Authenticator {
  id: string;
  issuer: string;
  account: string;
  secret: string;
  digits: number;
  period: number;
  createdAt: number;
}

export default function AuthenticatorPage() {
  const [authenticators, setAuthenticators] = useState<Authenticator[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newIssuer, setNewIssuer] = useState("");
  const [newAccount, setNewAccount] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [newDigits, setNewDigits] = useState(6);
  const [newPeriod, setNewPeriod] = useState(30);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeLeft, setTimeLeft] = useState(30 - (Math.floor(Date.now() / 1000) % 30));
  const [importUri, setImportUri] = useState("");

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(AUTHENTICATOR_DATA_KEY);
    if (saved) {
      try {
        const decrypted = deobfuscate(saved);
        if (decrypted) {
          const parsed = JSON.parse(decrypted);
          // Migrating old data if necessary
          const migrated = parsed.map((a: any) => ({
            ...a,
            digits: a.digits || 6,
            period: a.period || 30
          }));
          setAuthenticators(migrated);
        }
      } catch (e) {
        console.error("Failed to load authenticators", e);
        toast.error("Failed to load saved accounts");
      }
    }
  }, []);

  // Save data to localStorage
  const saveAuthenticators = useCallback((data: Authenticator[]) => {
    try {
      const encrypted = obfuscate(JSON.stringify(data));
      localStorage.setItem(AUTHENTICATOR_DATA_KEY, encrypted);
    } catch (e) {
      console.error("Failed to save authenticators", e);
      toast.error("Failed to save changes");
    }
  }, []);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      const seconds = Math.floor(Date.now() / 1000) % 30;
      setTimeLeft(30 - seconds);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAdd = () => {
    if (!newSecret.trim()) {
      toast.error("Secret key is required");
      return;
    }

    try {
      generateTOTP(newSecret, newPeriod, newDigits);
    } catch (e) {
      toast.error("Invalid secret key format (Base32 expected)");
      return;
    }

    const newAuth: Authenticator = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      issuer: newIssuer.trim() || "Other",
      account: newAccount.trim() || "No Name",
      secret: newSecret.trim().toUpperCase().replace(/\s/g, ""),
      digits: newDigits,
      period: newPeriod,
      createdAt: Date.now()
    };

    const updated = [...authenticators, newAuth];
    setAuthenticators(updated);
    saveAuthenticators(updated);
    
    // Reset form
    setNewIssuer("");
    setNewAccount("");
    setNewSecret("");
    setNewDigits(6);
    setNewPeriod(30);
    setIsAdding(false);
    toast.success("Account added successfully");
  };

  const handleUriImport = () => {
    if (!importUri.trim()) return;

    try {
      const url = new URL(importUri);
      if (url.protocol !== "otpauth:") throw new Error("Invalid protocol");
      
      const path = decodeURIComponent(url.pathname.substring(1)); // Issuer:Account
      const secret = url.searchParams.get("secret");
      const issuerParam = url.searchParams.get("issuer");
      const digits = parseInt(url.searchParams.get("digits") || "6");
      const period = parseInt(url.searchParams.get("period") || "30");

      if (!secret) throw new Error("Missing secret");

      let issuer = "Other";
      let account = "No Name";

      if (path.includes(":")) {
        const parts = path.split(":");
        issuer = parts[0].trim();
        account = parts.slice(1).join(":").trim();
      } else {
        account = path.trim();
        issuer = issuerParam || "Other";
      }

      setNewIssuer(issuer);
      setNewAccount(account);
      setNewSecret(secret);
      setNewDigits(digits);
      setNewPeriod(period);
      setImportUri("");
      toast.success("Details extracted from URI");
    } catch (e) {
      toast.error("Invalid OTPAuth URI");
    }
  };

  const exportData = () => {
    if (authenticators.length === 0) {
      toast.error("No accounts to export");
      return;
    }
    
    const data = localStorage.getItem(AUTHENTICATOR_DATA_KEY);
    if (!data) return;

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `authenticator-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success("Backup downloaded (Encrypted)");
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const decrypted = deobfuscate(content);
        if (!decrypted) throw new Error("Invalid backup file");
        
        const data = JSON.parse(decrypted);
        if (!Array.isArray(data)) throw new Error("Invalid data format");

        if (confirm(`Import ${data.length} accounts? This will overwrite your current list.`)) {
          setAuthenticators(data);
          saveAuthenticators(data);
          toast.success("Backup restored successfully");
        }
      } catch (e) {
        toast.error("Failed to import backup");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this account?")) {
      const updated = authenticators.filter(a => a.id !== id);
      setAuthenticators(updated);
      saveAuthenticators(updated);
      toast.success("Account removed");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const filteredAuthenticators = authenticators.filter(a => 
    a.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.account.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto gap-8 pt-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search accounts..."
            className="w-full bg-[#161618] border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Button 
              onClick={exportData}
              variant="outline"
              className="h-12 px-4 rounded-2xl border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-all gap-2"
              title="Export Backup"
            >
              <Download className="w-4 h-4" />
            </Button>
            <div className="relative">
              <input 
                type="file" 
                accept=".json" 
                onChange={importData} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                title="Import Backup"
              />
              <Button 
                variant="outline"
                className="h-12 px-4 rounded-2xl border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-all gap-2"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button 
            onClick={() => setIsAdding(true)}
            className="flex-1 md:flex-none h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Add Account
          </Button>
          
          <div className="flex items-center gap-3 px-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl h-12">
            <div className="relative w-5 h-5">
              <svg className="w-5 h-5 -rotate-90">
                <circle cx="10" cy="10" r="8" className="fill-none stroke-zinc-800" strokeWidth="2" />
                <circle
                  cx="10" cy="10" r="8"
                  className="fill-none stroke-primary transition-all duration-1000 ease-linear"
                  strokeWidth="2"
                  strokeDasharray={2 * Math.PI * 8}
                  strokeDashoffset={2 * Math.PI * 8 * (1 - timeLeft / 30)}
                />
              </svg>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-400 w-4">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Add Form Overlay */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] w-full max-w-md p-8 space-y-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsAdding(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <h2 className="text-xl font-black uppercase tracking-widest text-white">Add New Account</h2>
              <p className="text-xs text-zinc-500 font-medium">Extract from URI or enter manually</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Import via URL</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors pointer-events-none group-focus-within:text-primary">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="otpauth://totp/..."
                    className="flex h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 pl-12 pr-12 py-2 text-[10px] transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/50"
                    value={importUri}
                    onChange={(e) => setImportUri(e.target.value)}
                    onPaste={() => setTimeout(handleUriImport, 50)}
                  />
                  <button 
                    onClick={handleUriImport}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-600 hover:text-primary transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="h-[1px] bg-zinc-800 w-full" />

              <M3Input 
                label="Issuer"
                placeholder="Google, GitHub, AWS..."
                value={newIssuer}
                onChange={(e) => setNewIssuer(e.target.value)}
                icon={<Building2 className="w-4 h-4" />}
              />
              <M3Input 
                label="Account Name"
                placeholder="email@example.com"
                value={newAccount}
                onChange={(e) => setNewAccount(e.target.value)}
                icon={<User className="w-4 h-4" />}
              />
              <M3Input 
                label="Secret Key"
                placeholder="Paste your Base32 secret..."
                value={newSecret}
                onChange={(e) => setNewSecret(e.target.value)}
                icon={<Key className="w-4 h-4" />}
              />
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleAdd}
                className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20"
              >
                Save Account
              </Button>
              <Button 
                onClick={() => setIsAdding(false)}
                variant="outline"
                className="h-14 px-6 rounded-2xl border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-white transition-all"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Authenticators */}
      {filteredAuthenticators.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-20 grayscale gap-6">
          <ShieldCheck className="w-24 h-24" />
          <div className="text-center space-y-2">
            <p className="text-2xl font-black uppercase tracking-[0.3em] italic">No Accounts Found</p>
            <p className="text-xs font-bold uppercase tracking-widest">Add your first 2FA secret to get started</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuthenticators.map((auth) => {
            const code = generateTOTP(auth.secret, auth.period, auth.digits);
            const authTimeLeft = auth.period - (Math.floor(Date.now() / 1000) % auth.period);
            const isExpiring = authTimeLeft < 5;

            return (
              <div 
                key={auth.id}
                className={cn(
                  "bg-[#161618] border border-zinc-800 rounded-[2rem] p-6 transition-all group relative overflow-hidden shadow-xl",
                  isExpiring ? "border-amber-500/20" : "hover:border-primary/30"
                )}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{auth.issuer}</h3>
                    <p className="text-sm font-bold text-zinc-300 truncate max-w-[180px]">{auth.account}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(auth.id)}
                    className="p-2 text-zinc-600 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className={cn(
                    "flex-1 bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex items-center justify-center gap-4 relative group/code overflow-hidden transition-all",
                    isExpiring && "animate-pulse"
                  )}>
                    <span className={cn(
                      "text-3xl font-black tracking-[0.2em] font-mono transition-colors",
                      isExpiring ? "text-amber-500" : "text-white"
                    )}>
                      {code.substring(0, Math.floor(code.length / 2))} {code.substring(Math.floor(code.length / 2))}
                    </span>
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover/code:opacity-5 transition-opacity" />
                  </div>
                  
                  <button 
                    onClick={() => copyCode(code)}
                    className="h-14 w-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-primary hover:border-primary/50 transition-all shadow-inner"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>

                {/* Individual Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-900">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000 ease-linear",
                      isExpiring ? "bg-amber-500" : "bg-primary"
                    )}
                    style={{ width: `${(authTimeLeft / auth.period) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem] flex items-center justify-center gap-4">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-center">
          End-to-End Encryption • Local Storage Only • Open Source Logic
        </p>
      </div>
    </div>
  );
}
