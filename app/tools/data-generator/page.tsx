"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { 
  Dice5,
  RefreshCw,
  Copy,
  Download,
  User,
  Mail,
  Home,
  Phone,
  Terminal,
  FileCode,
  LayoutGrid,
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Select } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { faker } from "@faker-js/faker";

type DataType = "users" | "addresses" | "products" | "finance" | "internet";

export default function DataGeneratorPage() {
  const tool = TOOLS.find(t => t.id === "data-generator")!;
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [dataType, setDataType] = useState<DataType>("users");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateData = useCallback(() => {
    setIsGenerating(true);
    let data: any[] = [];

    for (let i = 0; i < count; i++) {
      switch (dataType) {
        case "users":
          data.push({
            id: faker.string.uuid(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            avatar: faker.image.avatar(),
          });
          break;
        case "addresses":
          data.push({
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zip: faker.location.zipCode(),
            country: faker.location.country(),
          });
          break;
        case "products":
          data.push({
            id: faker.string.uuid(),
            name: faker.commerce.productName(),
            price: faker.commerce.price(),
            category: faker.commerce.department(),
            description: faker.commerce.productDescription(),
          });
          break;
        case "finance":
          data.push({
            accountName: faker.finance.accountName(),
            accountNumber: faker.finance.accountNumber(),
            amount: faker.finance.amount(),
            currency: faker.finance.currencyCode(),
            iban: faker.finance.iban(),
          });
          break;
        case "internet":
          data.push({
            username: faker.internet.userName(),
            domain: faker.internet.domainName(),
            ip: faker.internet.ip(),
            userAgent: faker.internet.userAgent(),
            mac: faker.internet.mac(),
          });
          break;
      }
    }

    if (format === "json") {
      setOutput(JSON.stringify(data, null, 2));
    } else {
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(","),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(","))
      ].join("\n");
      setOutput(csv);
    }

    setTimeout(() => setIsGenerating(false), 300);
    toast.success(`Generated ${count} ${dataType} entries`);
  }, [count, dataType, format]);

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success("Data copied to clipboard");
  };

  const downloadFile = () => {
    if (!output) return;
    const blob = new Blob([output], { type: format === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock_${dataType}_${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Mock data downloaded as .${format}`);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="flex items-center gap-3 px-2">
                   <Settings2 className="w-4 h-4 text-primary" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Generator Config</h3>
                </div>

                <div className="space-y-6">
                   <M3Select 
                      label="Entity Type"
                      value={dataType}
                      onChange={(val) => setDataType(val as DataType)}
                      options={[
                        { label: "Users & Identities", value: "users" },
                        { label: "Addresses & Geo", value: "addresses" },
                        { label: "Products & Commerce", value: "products" },
                        { label: "Finance & Accounts", value: "finance" },
                        { label: "Internet & Network", value: "internet" },
                      ]}
                   />

                   <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Record Count</label>
                         <span className="text-xl font-black text-primary">{count}</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-primary"
                      />
                   </div>

                   <M3Select 
                      label="Output Format"
                      value={format}
                      onChange={(val) => setFormat(val as "json" | "csv")}
                      options={[
                        { label: "JSON Array", value: "json" },
                        { label: "CSV Spreadsheet", value: "csv" },
                      ]}
                   />
                </div>

                <Button 
                   onClick={generateData}
                   disabled={isGenerating}
                   className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/20"
                >
                   <RefreshCw className={cn("w-5 h-5", isGenerating && "animate-spin")} />
                   Generate Mock Data
                </Button>
             </div>

             <div className="bg-zinc-950/50 border border-zinc-900 p-6 rounded-3xl space-y-4">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Included Fields (Preview)</h4>
                <div className="grid grid-cols-2 gap-2">
                   {dataType === "users" && (
                     <>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50"><User className="w-3 h-3 text-primary" /> Name</div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50"><Mail className="w-3 h-3 text-primary" /> Email</div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50"><Phone className="w-3 h-3 text-primary" /> Phone</div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50"><Dice5 className="w-3 h-3 text-primary" /> UUID</div>
                     </>
                   )}
                   {dataType === "addresses" && (
                     <>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50"><Home className="w-3 h-3 text-primary" /> Street</div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50"><Globe className="w-3 h-3 text-primary" /> State</div>
                     </>
                   )}
                </div>
             </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-8 space-y-6">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileCode className="w-4 h-4 text-primary" />
                   </div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Synthetic Dataset Output</h3>
                </div>
                <div className="flex gap-2">
                   <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-[10px] uppercase font-bold text-zinc-500 hover:text-primary">
                      <Copy className="w-3 h-3 mr-2" /> Copy
                   </Button>
                   <Button variant="ghost" size="sm" onClick={downloadFile} className="text-[10px] uppercase font-bold text-zinc-500 hover:text-green-500">
                      <Download className="w-3 h-3 mr-2" /> Download
                   </Button>
                </div>
             </div>

             <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-10 flex flex-col min-h-[580px] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-all">
                   <LayoutGrid className="w-full h-full text-primary" />
                </div>

                <div className={cn(
                  "flex-1 font-mono text-[11px] leading-relaxed transition-all duration-300 overflow-auto max-h-[500px] scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent pr-4",
                  isGenerating ? "blur-sm opacity-50" : "blur-0 opacity-100"
                )}>
                   {output ? (
                     <pre className="text-zinc-400 whitespace-pre">
                       {output}
                     </pre>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center space-y-6">
                        <div className="w-20 h-20 rounded-[2.5rem] border border-zinc-800/50 flex items-center justify-center bg-zinc-900/30">
                           <Dice5 className="w-8 h-8 text-zinc-700 animate-pulse" />
                        </div>
                        <div className="text-center">
                           <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">No Data Active</p>
                           <p className="text-zinc-800 text-[9px] font-bold uppercase tracking-widest mt-1">Configure your dataset and hit generate</p>
                        </div>
                     </div>
                   )}
                </div>

                <div className="mt-8 bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                         <Terminal className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Security Note</p>
                         <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Zero-risk data for testing environments</p>
                      </div>
                   </div>
                   <div className="px-4 py-2 bg-green-500/5 border border-green-500/10 rounded-full">
                      <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Safe to export</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
