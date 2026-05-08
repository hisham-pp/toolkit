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
  Link2,
  Monitor,
  Globe,
  Mail,
  Cloud,
  MessageSquare,
  Triangle,
  Filter,
  Shield,
  Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { M3Input, M3Select, M3Textarea } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { cn } from "@/utility/helpers/utils";
import { generateTOTP, obfuscate, deobfuscate } from "@/utility/helpers/otp";
import { AUTHENTICATOR_DATA_KEY } from "@/utility/constants/storage-keys";
import { OTPAlgorithm } from "@/utility/enums/otp-algorithm";
import { OTPEncoding } from "@/utility/enums/otp-encoding";
import { Authenticator } from "@/utility/types/authenticator";
import { SERVICE_PRESETS } from "@/utility/constants/authenticator-presets";

export default function AuthenticatorPage() {
  const [authenticators, setAuthenticators] = useState<Authenticator[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedService, setSelectedService] = useState(SERVICE_PRESETS[0]);
  const [newIssuer, setNewIssuer] = useState("");
  const [newAccount, setNewAccount] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [newDigits, setNewDigits] = useState(6);
  const [newPeriod, setNewPeriod] = useState(30);
  const [newAlgorithm, setNewAlgorithm] = useState<OTPAlgorithm>(OTPAlgorithm.SHA1);
  const [newEncoding, setNewEncoding] = useState<OTPEncoding>(OTPEncoding.Auto);
  const [newRecoveryCode, setNewRecoveryCode] = useState("");
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [timeLeft, setTimeLeft] = useState(30 - (Math.floor(Date.now() / 1000) % 30));
  const [importUri, setImportUri] = useState("");
  const [viewingRecoveryAuth, setViewingRecoveryAuth] = useState<Authenticator | null>(null);
  const [editingAuth, setEditingAuth] = useState<Authenticator | null>(null);

  const [editIssuer, setEditIssuer] = useState("");
  const [editAccount, setEditAccount] = useState("");
  const [editRecoveryCode, setEditRecoveryCode] = useState("");

  const handleUpdate = () => {
    if (!editingAuth) return;
    
    const updated = authenticators.map(a => 
      a.id === editingAuth.id ? { 
        ...a, 
        issuer: editIssuer || "Unknown", 
        account: editAccount || "Unknown",
        recoveryCode: editRecoveryCode.trim() || undefined
      } : a
    );
    
    setAuthenticators(updated);
    saveAuthenticators(updated);
    setEditingAuth(null);
    toast.success("Account updated successfully");
  };

  const startEditing = (auth: Authenticator) => {
    setEditingAuth(auth);
    setEditIssuer(auth.issuer);
    setEditAccount(auth.account);
    setEditRecoveryCode(auth.recoveryCode || "");
  };

  const handleServiceChange = (serviceName: string) => {
    const preset = SERVICE_PRESETS.find(p => p.name === serviceName) || SERVICE_PRESETS[0];
    setSelectedService(preset);
    if (preset.name !== "Custom") {
      setNewIssuer(preset.name);
      setNewDigits(preset.digits);
      setNewPeriod(preset.period);
      setNewAlgorithm(preset.algorithm);
      setNewEncoding(preset.encoding);
    }
  };

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
            period: a.period || 30,
            algorithm: (a.algorithm as OTPAlgorithm) || OTPAlgorithm.SHA1,
            encoding: (a.encoding as OTPEncoding) || OTPEncoding.Auto
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
      // Validate secret by trying to generate a code
      generateTOTP(newSecret, newPeriod, newDigits, undefined, newAlgorithm, newEncoding);
    } catch (e: any) {
      toast.error(e.message || "Invalid secret key format");
      return;
    }

    const newAuth: Authenticator = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      issuer: newIssuer.trim() || "Other",
      account: newAccount.trim() || "No Name",
      secret: newSecret.trim().toUpperCase().replace(/\s/g, ""),
      digits: newDigits,
      period: newPeriod,
      algorithm: newAlgorithm,
      encoding: newEncoding,
      createdAt: Date.now(),
      recoveryCode: newRecoveryCode.trim() || undefined
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
    setNewAlgorithm(OTPAlgorithm.SHA1);
    setNewEncoding(OTPEncoding.Auto);
    setNewRecoveryCode("");
    setSelectedService(SERVICE_PRESETS[0]);
    setIsAdding(false);
    setIsAdvanced(false);
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
      const algorithmStr = url.searchParams.get("algorithm")?.toUpperCase();
      let algorithm = OTPAlgorithm.SHA1;
      if (algorithmStr === "SHA256") algorithm = OTPAlgorithm.SHA256;
      if (algorithmStr === "SHA512") algorithm = OTPAlgorithm.SHA512;

      if (!secret) throw new Error("Missing secret");

      let issuer = "Other";
      let account = "No Name";

      if (path.includes(":")) {
        const parts = path.split(":");
        issuer = parts[0].trim();
        account = parts.slice(1).join(":").trim();
      } else {
        const pathSegments = path.split("/");
        account = pathSegments[pathSegments.length - 1].trim();
        issuer = issuerParam || (pathSegments.length > 1 ? pathSegments[0] : "Other");
      }

      setNewIssuer(issuer);
      setNewAccount(account);
      setNewSecret(secret);
      setNewDigits(digits);
      setNewPeriod(period);
      setNewAlgorithm(algorithm);
      setNewEncoding(OTPEncoding.Auto);
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

  const copyRecoveryCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Recovery code copied to clipboard");
  };

  const filteredAuthenticators = authenticators.filter(a => {
    const matchesSearch = a.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.account.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = serviceFilter === "All" || a.issuer.toLowerCase() === serviceFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const uniqueIssuers = Array.from(new Set(authenticators.map(a => a.issuer))).sort();

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto gap-5 md:gap-8 pt-4 md:pt-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto flex-1">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search accounts..."
              className="w-full h-11 md:h-12 bg-[#161618] border border-zinc-800 rounded-xl md:rounded-2xl py-3 pl-12 pr-4 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-56">
            <M3Select
              value={serviceFilter}
              onChange={setServiceFilter}
              options={[
                { label: "All Services", value: "All" },
                ...uniqueIssuers.map(issuer => ({ label: issuer, value: issuer }))
              ]}
              placeholder="Filter by Service"
            />
          </div>
        </div>
        
        <div className="flex gap-3 md:gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 shrink-0">
            <Button 
              onClick={exportData}
              variant="outline"
              className="h-11 md:h-12 px-3 md:px-4 rounded-xl md:rounded-2xl border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-all gap-2"
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
                className="h-11 md:h-12 px-3 md:px-4 rounded-xl md:rounded-2xl border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-all gap-2"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button 
            onClick={() => setIsAdding(true)}
            className="flex-1 md:flex-none h-11 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-[0.2em] md:tracking-widest gap-2 shadow-lg shadow-primary/20 text-[11px] md:text-sm"
          >
            <Plus className="w-4 h-4" /> Add Account
          </Button>
          
          <div className="flex items-center justify-center gap-3 px-3 md:px-4 bg-zinc-900/50 border border-zinc-800 rounded-xl md:rounded-2xl h-11 md:h-12 shrink-0">
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
          <div className="bg-[#161618] border border-zinc-800 rounded-[2rem] md:rounded-[2.5rem] w-full max-w-md p-6 md:p-8 space-y-6 md:space-y-8 shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh] scrollbar-hide">
            <button 
              onClick={() => setIsAdding(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-500 hover:text-white transition-colors flex items-center justify-center p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white italic">Add New Account</h2>
              <p className="text-[10px] md:text-xs text-zinc-500 font-medium uppercase tracking-widest">Import via URI or enter manually</p>
            </div>

            <div className="space-y-6">
              <M3Select
                label="Service Preset"
                value={selectedService.name}
                onChange={handleServiceChange}
                options={SERVICE_PRESETS.map(s => ({ label: s.name, value: s.name }))}
              />

              <div className="h-[1px] bg-zinc-800 w-full" />

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
                disabled={selectedService.name !== "Custom"}
              />
              <M3Input 
                label="Account Name (e.g. Email)"
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
              <M3Textarea 
                label="Recovery Codes (Optional)"
                placeholder="Paste your backup recovery codes here (one per line or space-separated)..."
                value={newRecoveryCode}
                onChange={(e) => setNewRecoveryCode(e.target.value)}
                rows={3}
                className="min-h-[100px] text-xs font-mono"
              />

              <div className="space-y-4">
                <button 
                  onClick={() => setIsAdvanced(!isAdvanced)}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
                >
                  {isAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
                </button>

                {isAdvanced && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-4">
                      <M3Select
                        label="Digits"
                        value={newDigits.toString()}
                        onChange={(v) => setNewDigits(parseInt(v))}
                        options={[
                          { label: "6 Digits", value: "6" },
                          { label: "8 Digits", value: "8" }
                        ]}
                      />
                      <M3Select
                        label="Period"
                        value={newPeriod.toString()}
                        onChange={(v) => setNewPeriod(parseInt(v))}
                        options={[
                          { label: "30 Seconds", value: "30" },
                          { label: "60 Seconds", value: "60" }
                        ]}
                      />
                    </div>
                    <M3Select
                      label="Algorithm"
                      value={newAlgorithm}
                      onChange={(v) => setNewAlgorithm(v as OTPAlgorithm)}
                      options={[
                        { label: "SHA-1 (Default)", value: OTPAlgorithm.SHA1 },
                        { label: "SHA-256", value: OTPAlgorithm.SHA256 },
                        { label: "SHA-512", value: OTPAlgorithm.SHA512 }
                      ]}
                    />
                    <M3Select
                      label="Secret Encoding"
                      value={newEncoding}
                      onChange={(v) => setNewEncoding(v as OTPEncoding)}
                      options={[
                        { label: "Auto-detect (Recommended)", value: OTPEncoding.Auto },
                        { label: "Base32", value: OTPEncoding.Base32 },
                        { label: "Hex", value: OTPEncoding.Hex }
                      ]}
                    />
                  </div>
                )}
              </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {filteredAuthenticators.map((auth) => {
            let code = "000000";
            try {
              code = generateTOTP(auth.secret, auth.period, auth.digits, undefined, auth.algorithm, auth.encoding);
            } catch (e) {
              code = "ERROR";
            }
            const authTimeLeft = auth.period - (Math.floor(Date.now() / 1000) % auth.period);
            const isExpiring = authTimeLeft < 5;

            return (
              <div 
                key={auth.id}
                className={cn(
                  "bg-[#161618] border border-zinc-800 rounded-[1.4rem] md:rounded-[2rem] p-4 md:p-6 transition-all group relative overflow-hidden shadow-xl",
                  isExpiring ? "border-amber-500/20" : "hover:border-primary/30"
                )}
              >
                <div className="flex items-start justify-between gap-3 mb-4 md:mb-6">
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="w-10 h-10 md:w-10 md:h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-primary shadow-inner shrink-0">
                      {(() => {
                        const preset = SERVICE_PRESETS.find(p => p.name.toLowerCase() === auth.issuer.toLowerCase());
                        const Icon = preset?.icon || ShieldCheck;
                        return <Icon className="w-5 h-5" />;
                      })()}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary truncate">{auth.issuer}</h3>
                        <div className="flex gap-1 shrink-0">
                          {auth.algorithm && auth.algorithm !== OTPAlgorithm.SHA1 && (
                            <span className="text-[8px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-md font-bold uppercase">{auth.algorithm}</span>
                          )}
                          {auth.encoding && auth.encoding !== OTPEncoding.Auto && (
                            <span className="text-[8px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded-md font-bold uppercase">{auth.encoding}</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-zinc-300 truncate max-w-[180px]">{auth.account}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 items-center shrink-0">
                    <button 
                      onClick={() => startEditing(auth)}
                      className="p-2 text-zinc-600 hover:text-primary transition-colors rounded-lg hover:bg-primary/10 flex items-center justify-center"
                      title="Edit Account"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {auth.recoveryCode && (
                      <button 
                        onClick={() => setViewingRecoveryAuth(auth)}
                        className="p-2 text-zinc-600 hover:text-primary transition-colors rounded-lg hover:bg-primary/10 flex items-center justify-center"
                        title="View Recovery Codes"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(auth.id)}
                      className="p-2 text-zinc-600 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex-1 bg-zinc-950 border border-zinc-900 rounded-[1.25rem] md:rounded-2xl px-4 py-3 md:p-4 relative group/code overflow-hidden transition-all",
                    isExpiring && "border-amber-500/50 shadow-[0_0_15px_-5px_rgba(245,158,11,0.2)]"
                  )}>
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={`${auth.id}-${code}`}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "block text-[2rem] leading-none md:text-3xl font-black tracking-[0.18em] md:tracking-[0.2em] font-mono transition-colors relative z-10",
                          isExpiring ? "text-amber-500" : "text-white"
                        )}
                      >
                        {code.substring(0, Math.floor(code.length / 2))} {code.substring(Math.floor(code.length / 2))}
                      </motion.span>
                    </AnimatePresence>
                    <div className="mt-2 flex items-center justify-between gap-3 relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
                        Refreshes in {authTimeLeft}s
                      </p>
                      <div className={cn(
                        "h-2 w-16 md:w-20 overflow-hidden rounded-full bg-zinc-800",
                        isExpiring && "bg-amber-950/60"
                      )}>
                        <motion.div
                          initial={false}
                          animate={{
                            width: `${(authTimeLeft / auth.period) * 100}%`,
                            backgroundColor: isExpiring ? "#f59e0b" : "#6366f1"
                          }}
                          transition={{ duration: 1, ease: "linear" }}
                          className="h-full rounded-full"
                        />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover/code:opacity-5 transition-opacity" />
                    {isExpiring && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.05, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 bg-amber-500"
                      />
                    )}
                  </div>
                  
                  <button 
                    onClick={() => copyCode(code)}
                    className="h-12 w-12 md:h-14 md:w-14 bg-zinc-900 border border-zinc-800 rounded-xl md:rounded-2xl flex items-center justify-center text-zinc-500 hover:text-primary hover:border-primary/50 transition-all shadow-inner shrink-0"
                    title="Copy Code"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Account Overlay */}
      {editingAuth && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161618] border border-zinc-800 rounded-[2rem] md:rounded-[2.5rem] w-full max-w-md p-6 md:p-8 space-y-6 md:space-y-8 shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh] scrollbar-hide">
            <button 
              onClick={() => setEditingAuth(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-500 hover:text-white transition-colors flex items-center justify-center p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 text-center">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-white italic">Edit Account</h2>
              <p className="text-[10px] md:text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Update account details</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <M3Input 
                  label="Service Name"
                  placeholder="e.g. Google, GitHub..."
                  value={editIssuer}
                  onChange={(e) => setEditIssuer(e.target.value)}
                  icon={<Globe className="w-4 h-4" />}
                />
                <M3Input 
                  label="Account Email / Name"
                  placeholder="e.g. user@example.com"
                  value={editAccount}
                  onChange={(e) => setEditAccount(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                />
                <M3Textarea 
                  label="Recovery Codes (Optional)"
                  placeholder="Paste backup codes..."
                  value={editRecoveryCode}
                  onChange={(e) => setEditRecoveryCode(e.target.value)}
                  rows={3}
                  className="min-h-[100px] text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleUpdate}
                className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20"
              >
                Update Account
              </Button>
              <Button 
                onClick={() => setEditingAuth(null)}
                variant="outline"
                className="h-14 px-6 rounded-2xl border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-white transition-all"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Recovery Codes Overlay */}
      {viewingRecoveryAuth && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161618] border border-zinc-800 rounded-[2rem] md:rounded-[2.5rem] w-full max-w-md p-6 md:p-8 space-y-6 md:space-y-8 shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh] scrollbar-hide">
            <button 
              onClick={() => setViewingRecoveryAuth(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-500 hover:text-white transition-colors flex items-center justify-center p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-white italic">Recovery Codes</h2>
              <p className="text-[10px] md:text-xs text-zinc-500 font-medium">{viewingRecoveryAuth.issuer} - {viewingRecoveryAuth.account}</p>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl md:rounded-3xl p-4 md:p-6 font-mono text-xs md:text-sm text-zinc-300 whitespace-pre-wrap break-all min-h-[120px] max-h-[300px] overflow-y-auto scrollbar-hide">
              {viewingRecoveryAuth.recoveryCode}
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => {
                  copyRecoveryCode(viewingRecoveryAuth.recoveryCode!);
                  setViewingRecoveryAuth(null);
                }}
                className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20"
              >
                Copy All Codes
              </Button>
              <Button 
                onClick={() => setViewingRecoveryAuth(null)}
                variant="outline"
                className="h-14 px-6 rounded-2xl border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-white transition-all"
              >
                Close
              </Button>
            </div>
          </div>
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
