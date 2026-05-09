"use client";

import { useState } from "react";
import { Copy, Monitor, QrCode, RefreshCw, Scan, Smartphone, Unplug, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

import { useSync } from "@/components/sync-provider";

export default function SettingsPage() {
  const {
    activeSenderDevices,
    cleanupSync,
    connectionLogs,
    deviceName,
    disconnectSenderDevice,
    handleReceiverApproval,
    handleReject,
    handleScannedData,
    handleSenderApproval,
    handleSenderReject,
    isManualEntry,
    manualPairingString,
    p2pRole,
    pairingString,
    pairingOtp,
    pendingSenderDevices,
    receiverDeviceName,
    requestManualSync,
    saveDeviceName,
    setDeviceName,
    setManualPairingString,
    startCamera,
    startSync,
    syncPhase,
    connectWithOtp,
  } = useSync();

  const [otpInput, setOtpInput] = useState("");

  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] border border-zinc-800 bg-[#111113] p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-primary">Sync Provider</p>
            <h2 className="text-3xl font-black uppercase italic tracking-tight text-white">Manual device sync</h2>
            <p className="max-w-2xl text-sm text-zinc-400">
              The refresh button in the navbar now syncs from the device that clicks it. If both devices changed after the last sync, you will be asked which version to keep.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void requestManualSync()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-3 text-xs font-black uppercase tracking-[0.25em] text-primary transition hover:bg-primary hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Sync now
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <input
            value={deviceName}
            onChange={(event) => setDeviceName(event.target.value)}
            placeholder="Name this device"
            className="h-12 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-primary"
          />
          <button
            type="button"
            onClick={() => saveDeviceName(deviceName)}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 text-xs font-black uppercase tracking-[0.2em] text-zinc-200 transition hover:border-primary hover:text-white"
          >
            Save device name
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => void startSync("sender")}
          className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8 text-left transition hover:border-primary/60"
        >
          <Monitor className="h-9 w-9 text-primary" />
          <h3 className="mt-5 text-xl font-black uppercase tracking-wide text-white">Show pairing code</h3>
          <p className="mt-2 text-sm text-zinc-400">Use this device as the source. Other devices join this session and can pull data when needed.</p>
        </button>

        <button
          type="button"
          onClick={() => {
            void startCamera();
          }}
          className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8 text-left transition hover:border-primary/60"
        >
          <Scan className="h-9 w-9 text-primary" />
          <h3 className="mt-5 text-xl font-black uppercase tracking-wide text-white">Scan pairing code</h3>
          <p className="mt-2 text-sm text-zinc-400">Use this device as the destination. After connection, the navbar refresh button can sync changes either way.</p>
        </button>
      </section>

      {syncPhase !== "idle" ? (
        <section className="rounded-[2rem] border border-zinc-800 bg-[#111113] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-zinc-500">Current session</p>
              <h3 className="mt-2 text-2xl font-black uppercase italic text-white">{p2pRole === "sender" ? "Source device" : "Destination device"}</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Status: <span className="font-bold uppercase text-primary">{syncPhase}</span>
                {receiverDeviceName ? ` • Connected to ${receiverDeviceName}` : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={cleanupSync}
              className="inline-flex items-center gap-2 self-start rounded-full border border-zinc-800 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-300 transition hover:border-red-500/50 hover:text-red-300"
            >
              <X className="h-4 w-4" />
              End session
            </button>
          </div>

          {connectionLogs.length ? (
            <div className="mt-6 rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Recent log</p>
              <div className="mt-3 space-y-2">
                {connectionLogs.map((log) => (
                  <p key={`${log}-${Math.random()}`} className="text-xs text-zinc-400">
                    {log}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          {p2pRole === "sender" ? (
            <div className="mt-6 space-y-6">
              {pairingOtp ? (
                <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-6">
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Pairing code</p>
                      <div className="flex gap-2">
                        {pairingOtp.split("").map((digit, i) => (
                          <div
                            key={i}
                            className="flex h-14 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-2xl font-black text-primary md:h-16 md:w-12 md:text-3xl"
                          >
                            {digit}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-zinc-400">Enter this 6-digit code on your other device to connect.</p>
                    </div>

                    <div className="flex flex-col items-start gap-4 lg:items-end">
                      <div className="rounded-[1.5rem] border border-zinc-800 bg-white p-4">
                        <QRCodeSVG value={pairingString} size={148} bgColor="#ffffff" fgColor="#09090b" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard.writeText(pairingOtp);
                            toast.success("OTP copied");
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-200 transition hover:border-primary hover:text-white"
                        >
                          Copy code
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard.writeText(pairingString);
                            toast.success("Long code copied");
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200"
                        >
                          Copy long code
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {pendingSenderDevices.length ? (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Waiting for approval</p>
                  {pendingSenderDevices.map((device) => (
                    <div key={device.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-white">{device.name}</p>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{device.id}</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleSenderApproval(device.id)}
                          className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary transition hover:bg-primary hover:text-white"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSenderReject(device.id)}
                          className="rounded-full border border-zinc-800 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-300 transition hover:border-red-500/50 hover:text-red-300"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Paired devices</p>
                {activeSenderDevices.length ? (
                  activeSenderDevices.map((device) => (
                    <div key={device.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-white">{device.name}</p>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{device.status}</p>
                      </div>
                      {device.status === "connected" ? (
                        <button
                          type="button"
                          onClick={() => disconnectSenderDevice(device.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-300 transition hover:border-red-500/50 hover:text-red-300"
                        >
                          <Unplug className="h-4 w-4" />
                          Disconnect
                        </button>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-500">
                    No devices paired yet.
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {p2pRole === "receiver" ? (
            <div className="mt-6 space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-6">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Enter pairing code</p>
                    </div>
                    <div className="mt-6 flex justify-between gap-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <input
                          key={i}
                          type="text"
                          maxLength={1}
                          value={otpInput[i] || ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            const newOtpArr = otpInput.split("");
                            if (val) {
                              newOtpArr[i] = val;
                              const finalOtp = newOtpArr.join("").slice(0, 6);
                              setOtpInput(finalOtp);
                              if (i < 5) {
                                const next = e.currentTarget.nextElementSibling as HTMLInputElement;
                                if (next) next.focus();
                              }
                            } else {
                              newOtpArr[i] = "";
                              setOtpInput(newOtpArr.join(""));
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace" && !otpInput[i] && i > 0) {
                              const prev = e.currentTarget.previousElementSibling as HTMLInputElement;
                              if (prev) prev.focus();
                            }
                          }}
                          className="h-14 w-full rounded-xl border border-zinc-800 bg-zinc-900 text-center text-xl font-black text-white outline-none transition focus:border-primary md:h-16 md:text-2xl"
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={otpInput.length !== 6}
                      onClick={() => void connectWithOtp(otpInput)}
                      className="mt-6 w-full rounded-full border border-primary/40 bg-primary/10 py-3 text-xs font-black uppercase tracking-[0.2em] text-primary transition hover:bg-primary hover:text-white disabled:opacity-30"
                    >
                      Connect with code
                    </button>
                  </div>

                  <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-5">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Paste long code</p>
                    </div>
                    <textarea
                      value={manualPairingString}
                      onChange={(event) => setManualPairingString(event.target.value)}
                      placeholder="toolkit-sync:v1:..."
                      className="mt-4 h-32 w-full rounded-[1.5rem] border border-zinc-800 bg-[#111113] p-4 text-sm text-white outline-none transition focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => handleScannedData(manualPairingString)}
                      className="mt-4 w-full rounded-full border border-zinc-800 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-300 transition hover:border-primary hover:text-white"
                    >
                      Connect with long code
                    </button>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-5">
                  <div className="flex items-center gap-3">
                    <QrCode className="h-5 w-5 text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Scan QR code</p>
                  </div>
                  <div className="relative mt-4 h-[380px] overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-black">
                    <div id="qr-reader" className="absolute inset-0" />
                  </div>
                  {isManualEntry ? <p className="mt-3 text-xs text-zinc-500">Camera unavailable. Use manual entry.</p> : null}
                </div>
              </div>

              {syncPhase === "confirming" ? (
                <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-sm text-zinc-300">
                    {receiverDeviceName || "The source device"} is requesting a connection. Approve to receive its current snapshot and enable manual refresh sync from either device.
                  </p>
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={handleReceiverApproval}
                      className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary transition hover:bg-primary hover:text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      className="rounded-full border border-zinc-800 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-300 transition hover:border-red-500/50 hover:text-red-300"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">What changed</p>
        <div className="mt-4 space-y-3 text-sm text-zinc-400">
          <p>Sync is now manual. The refresh icon in the navbar starts a full app snapshot sync from the device that clicked it.</p>
          <p>Saved data now syncs as a full snapshot instead of timer-based incremental pushes, so all local app pages stay in one consistent version.</p>
          <p>You can name the current device, and that name is sent with pairing, approvals, sync status, and conflict resolution.</p>
          <p>If both sides changed since the last sync, a chooser appears so you decide which device should win.</p>
        </div>
      </section>
    </div>
  );
}
