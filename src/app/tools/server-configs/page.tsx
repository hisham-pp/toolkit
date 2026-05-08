"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  Terminal, 
  Server, 
  Globe, 
  Shield, 
  Edit2,
  Check,
  X,
  Key as KeyIcon,
  Search,
  Lock,
  Unlock,
  AlertCircle,
  Eye,
  EyeOff,
  Power,
  PowerOff,
  Filter
} from "lucide-react";
import { M3Input, M3Textarea, M3Password } from "@/components/ui/m3-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { SSHConfig } from "@/utility/types/ssh-config";
import { SSH_CONFIGS_KEY, SSH_VAULT_KEY } from "@/utility/constants/storage-keys";
import { cn } from "@/utility/helpers/utils";
import CryptoJS from "crypto-js";

export default function SSHConfigPage() {
  const [configs, setConfigs] = useState<SSHConfig[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  
  // Encryption state - now defaults to the constant key
  const [encryptionKey, setEncryptionKey] = useState(SSH_VAULT_KEY);
  const [isLocked, setIsLocked] = useState(false);
  const [hasStoredData, setHasStoredData] = useState(false);

  const [formData, setFormData] = useState<Partial<SSHConfig>>({
    name: "",
    ip: "",
    domain: "",
    port: 22,
    username: "root",
    sshKey: "",
    notes: "",
    isActive: true
  });

  useEffect(() => {
    const saved = localStorage.getItem(SSH_CONFIGS_KEY);
    if (saved) {
      setHasStoredData(true);
      
      // Try to decrypt with the constant key first
      try {
        const bytes = CryptoJS.AES.decrypt(saved, SSH_VAULT_KEY);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        
        if (decryptedData) {
          const parsed = JSON.parse(decryptedData);
          if (Array.isArray(parsed)) {
            setConfigs(parsed);
            setEncryptionKey(SSH_VAULT_KEY);
            setIsLocked(false);
            return;
          }
        }
      } catch (e) {
        // Continue to check if it's unencrypted or using a custom key
      }

      // Try to see if it's unencrypted
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setConfigs(parsed);
          setIsLocked(false);
        }
      } catch (e) {
        // Data is likely encrypted with a custom key
        setIsLocked(true);
      }
    }
  }, []);

  const handleUnlock = () => {
    if (!encryptionKey) {
      toast.error("Please enter a decryption key");
      return;
    }

    const saved = localStorage.getItem(SSH_CONFIGS_KEY);
    if (!saved) {
      setIsLocked(false);
      return;
    }

    try {
      const bytes = CryptoJS.AES.decrypt(saved, encryptionKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedData) {
        throw new Error("Invalid key");
      }

      const parsed = JSON.parse(decryptedData);
      if (Array.isArray(parsed)) {
        setConfigs(parsed);
        setIsLocked(false);
        toast.success("Vault unlocked successfully");
      } else {
        throw new Error("Invalid data format");
      }
    } catch (e) {
      toast.error("Invalid decryption key or corrupted data");
    }
  };

  const saveConfigs = (newConfigs: SSHConfig[]) => {
    setConfigs(newConfigs);
    
    // Always encrypt, even if using the constant key
    const keyToUse = encryptionKey || SSH_VAULT_KEY;
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(newConfigs), keyToUse).toString();
    localStorage.setItem(SSH_CONFIGS_KEY, encrypted);
    
    setHasStoredData(newConfigs.length > 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || (!formData.ip && !formData.domain)) {
      toast.error("Please fill in the required fields (Name, Username, and IP or Domain)");
      return;
    }

    let newConfigs: SSHConfig[];
    if (editingId) {
      newConfigs = configs.map(c => 
        c.id === editingId ? { ...c, ...formData as SSHConfig } : c
      );
      toast.success("Server configuration updated");
      setEditingId(null);
    } else {
      const newConfig: SSHConfig = {
        ...formData as SSHConfig,
        id: formData.id || Math.random().toString(36).substring(7),
        isActive: formData.isActive ?? true,
        createdAt: Date.now()
      } as SSHConfig;
      newConfigs = [newConfig, ...configs];
      setIsAdding(false);
      toast.success("Server configuration added");
    }

    saveConfigs(newConfigs);
    setFormData({
      name: "",
      ip: "",
      domain: "",
      port: 22,
      username: "root",
      sshKey: "",
      notes: "",
      isActive: true
    });
  };

  const handleEdit = (config: SSHConfig) => {
    setFormData(config);
    setEditingId(config.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this configuration?")) {
      saveConfigs(configs.filter(c => c.id !== id));
      toast.success("Configuration deleted");
    }
  };

  const toggleActive = (config: SSHConfig) => {
    const newConfigs = configs.map(c => 
      c.id === config.id ? { ...c, isActive: !c.isActive } : c
    );
    saveConfigs(newConfigs);
    toast.success(`Server ${!config.isActive ? 'activated' : 'deactivated'}`);
  };

  const copySSHCommand = (config: SSHConfig) => {
    const host = config.domain || config.ip;
    const command = `ssh ${config.username}@${host}${config.port !== 22 ? ` -p ${config.port}` : ""}`;
    navigator.clipboard.writeText(command);
    toast.success("SSH command copied to clipboard");
  };

  const downloadConfig = (config: SSHConfig) => {
    const host = config.domain || config.ip;
    const content = `Host ${config.name.replace(/\s+/g, "-").toLowerCase()}
    HostName ${host}
    User ${config.username}
    Port ${config.port}
${config.sshKey ? `    # Note: SSH Private Key included below\n    IdentityFile ~/.ssh/${config.name.replace(/\s+/g, "-").toLowerCase()}.key` : ""}
`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.name.replace(/\s+/g, "-").toLowerCase()}.conf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Configuration file downloaded");
  };

  const filteredConfigs = configs.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.ip && c.ip.includes(search)) ||
      (c.domain && c.domain.toLowerCase().includes(search.toLowerCase()));
    
    const matchesFilter = showInactive || c.isActive;
    
    return matchesSearch && matchesFilter;
  });

  if (isLocked && hasStoredData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] max-w-md mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
          <Lock className="w-10 h-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Vault Locked</h2>
          <p className="text-zinc-500 text-sm">Enter your custom secret key to decrypt and access your server configurations.</p>
        </div>
        <div className="w-full space-y-4">
          <M3Password 
            label="Secret Key"
            placeholder="Enter key to unlock..."
            value={encryptionKey === SSH_VAULT_KEY ? "" : encryptionKey}
            onChange={(e) => setEncryptionKey(e.target.value)}
          />
          <Button 
            onClick={handleUnlock}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest"
          >
            Unlock Vault
          </Button>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-[10px] text-amber-500/80 leading-relaxed uppercase tracking-wider font-bold">
            If you lose your custom secret key, the data cannot be recovered.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Encryption Header */}
      <Card className="p-4 bg-zinc-900/30 border-zinc-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl flex items-center justify-center",
            encryptionKey ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
          )}>
            {encryptionKey ? <Shield className="w-5 h-5" /> : <Shield className="w-5 h-5 opacity-50" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Storage Status</h4>
            <p className="text-[10px] text-zinc-500 font-medium">
              {encryptionKey === SSH_VAULT_KEY ? "Default Encryption Active" : "Custom AES-256 Encryption Active"}
            </p>
          </div>
        </div>
        <div className="flex-1 max-w-xs w-full">
          <M3Password 
            label={encryptionKey === SSH_VAULT_KEY ? "Set Custom Key (Optional)" : "Custom Secret Key"}
            placeholder="Set Secret Key..."
            value={encryptionKey === SSH_VAULT_KEY ? "" : encryptionKey}
            onChange={(e) => {
              const newKey = e.target.value || SSH_VAULT_KEY;
              setEncryptionKey(newKey);
              if (configs.length > 0) {
                 const encrypted = CryptoJS.AES.encrypt(JSON.stringify(configs), newKey).toString();
                 localStorage.setItem(SSH_CONFIGS_KEY, encrypted);
              }
            }}
          />
        </div>
      </Card>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search servers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-zinc-100"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowInactive(!showInactive)}
            variant="outline"
            className={cn(
              "rounded-xl h-12 px-6 border-zinc-800 font-bold uppercase tracking-wider text-xs flex items-center gap-2 transition-all",
              showInactive ? "bg-zinc-900 text-zinc-400" : "bg-primary/10 border-primary/20 text-primary"
            )}
            title={showInactive ? "Showing all" : "Showing active only"}
          >
            {showInactive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showInactive ? "Show All" : "Active Only"}
          </Button>
          {configs.length > 0 && (
            <Button 
              onClick={() => {
                const content = configs.map(config => {
                  const host = config.domain || config.ip;
                  return `Host ${config.name.replace(/\s+/g, "-").toLowerCase()}
    HostName ${host}
    User ${config.username}
    Port ${config.port}
${config.sshKey ? `    # Note: SSH Key was provided in the tool` : ""}
`;
                }).join("\n");
                const blob = new Blob([content], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `ssh-configs.conf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success("All configurations downloaded");
              }}
              variant="outline"
              className="rounded-xl h-12 px-6 border-zinc-800 hover:bg-zinc-900 text-zinc-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download All
            </Button>
          )}
          <Button 
            onClick={() => {
              setIsAdding(!isAdding);
              if (editingId) {
                setEditingId(null);
                setFormData({ name: "", ip: "", domain: "", port: 22, username: "root", sshKey: "", notes: "", isActive: true });
              }
            }}
            className="rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-xs flex items-center gap-2"
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isAdding ? "Cancel" : "Add Server"}
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="p-6 bg-zinc-950/50 border-zinc-800 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <M3Input 
                label="Server Name"
                placeholder="Production API"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                icon={<Server className="w-4 h-4" />}
              />
              <M3Input 
                label="Username"
                placeholder="root"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                icon={<Shield className="w-4 h-4" />}
              />
              <M3Input 
                label="IP Address"
                placeholder="1.2.3.4"
                value={formData.ip}
                onChange={e => setFormData({ ...formData, ip: e.target.value })}
                icon={<Globe className="w-4 h-4" />}
              />
              <M3Input 
                label="Domain"
                placeholder="api.example.com"
                value={formData.domain}
                onChange={e => setFormData({ ...formData, domain: e.target.value })}
                icon={<Globe className="w-4 h-4" />}
              />
              <M3Input 
                label="Port"
                type="number"
                placeholder="22"
                value={formData.port}
                onChange={e => setFormData({ ...formData, port: parseInt(e.target.value) || 22 })}
                icon={<Terminal className="w-4 h-4" />}
              />
              <M3Input 
                label="Unique Key / ID"
                placeholder="custom-key-123"
                value={formData.id || ""}
                disabled={!!editingId}
                onChange={e => setFormData({ ...formData, id: e.target.value })}
                icon={<KeyIcon className="w-4 h-4" />}
              />
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 w-fit">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  formData.isActive ? "bg-primary text-white" : "bg-zinc-800 text-zinc-500"
                )}
              >
                {formData.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
              </button>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Default Status</p>
                <p className="text-xs text-zinc-100 font-medium">{formData.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>

            <M3Textarea 
              label="SSH Private Key (Optional)"
              placeholder="Paste your private key here..."
              className="min-h-[120px] font-mono text-xs"
              value={formData.sshKey}
              onChange={e => setFormData({ ...formData, sshKey: e.target.value })}
            />
            <M3Textarea 
              label="Notes"
              placeholder="Internal server for staging..."
              className="min-h-[80px]"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
              <Button 
                type="submit"
                className="rounded-xl h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-xs"
              >
                {editingId ? "Update Configuration" : "Save Configuration"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConfigs.length > 0 ? (
          filteredConfigs.map(config => (
            <Card key={config.id} className={cn(
              "group p-6 bg-zinc-950/40 border-zinc-800 hover:border-primary/30 transition-all duration-300 rounded-3xl flex flex-col h-full relative overflow-hidden",
              !config.isActive && "opacity-60 grayscale-[0.5]"
            )}>
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button 
                  onClick={() => toggleActive(config)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    config.isActive ? "bg-zinc-900 text-zinc-400 hover:text-white" : "bg-primary/20 text-primary hover:bg-primary/30"
                  )}
                  title={config.isActive ? "Deactivate" : "Activate"}
                >
                  {config.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => handleEdit(config)}
                  className="p-2 bg-zinc-900 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(config.id)}
                  className="p-2 bg-zinc-900 rounded-lg hover:bg-red-900/50 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors",
                  config.isActive ? "bg-zinc-900 text-primary border-zinc-800" : "bg-zinc-950 text-zinc-700 border-zinc-900"
                )}>
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-zinc-100 text-lg leading-tight">{config.name}</h3>
                    {!config.isActive && <span className="text-[8px] font-black uppercase tracking-widest bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">Inactive</span>}
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-1">{config.username}@{config.domain || config.ip}</p>
                </div>
              </div>

              <div className="space-y-2 mb-6 flex-1">
                <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-900/50">
                  <span className="text-zinc-500 uppercase tracking-widest font-bold">Host</span>
                  <span className="text-zinc-300 font-mono">{config.domain || config.ip}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-900/50">
                  <span className="text-zinc-500 uppercase tracking-widest font-bold">Port</span>
                  <span className="text-zinc-300 font-mono">{config.port}</span>
                </div>
                {config.notes && (
                  <p className="text-xs text-zinc-500 mt-4 line-clamp-2 italic">"{config.notes}"</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-auto">
                <Button 
                  onClick={() => copySSHCommand(config)}
                  variant="outline"
                  disabled={!config.isActive}
                  className="rounded-xl h-10 border-zinc-800 hover:bg-zinc-900 text-[10px] font-bold uppercase tracking-wider"
                >
                  <Copy className="w-3.5 h-3.5 mr-2" />
                  Copy Cmd
                </Button>
                <Button 
                  onClick={() => downloadConfig(config)}
                  variant="outline"
                  disabled={!config.isActive}
                  className="rounded-xl h-10 border-zinc-800 hover:bg-zinc-900 text-[10px] font-bold uppercase tracking-wider"
                >
                  <Download className="w-3.5 h-3.5 mr-2" />
                  Download
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-600 space-y-4">
            <div className="w-20 h-20 rounded-full bg-zinc-900/50 flex items-center justify-center border border-zinc-800/50">
              <Server className="w-10 h-10 opacity-20" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">No server configurations found</p>
              <p className="text-sm opacity-60">{search ? "Try adjusting your search or filters" : "Add your first server to get started"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
