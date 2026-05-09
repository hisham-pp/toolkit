import { TodoWorkspace } from "./todo";

export type SyncPhase = "idle" | "pairing" | "connecting" | "confirming" | "connected" | "error";
export type SyncRole = "sender" | "receiver" | null;
export type SignalType = "JOIN" | "OFFER" | "ANSWER" | "APPROVE" | "REJECT" | "DISCONNECT";
export type PeerMessageType =
  | "FULL_SNAPSHOT"
  | "SYNC_REQUEST"
  | "SYNC_RESULT"
  | "FORCE_APPLY"
  | "HELLO";
export type SenderDeviceStatus =
  | "joined"
  | "offer_sent"
  | "awaiting_approval"
  | "connecting"
  | "connected"
  | "rejected"
  | "disconnected"
  | "error";

export type SenderDevice = {
  id: string;
  name: string;
  status: SenderDeviceStatus;
  remoteSdp?: string;
  lastUpdated: number;
};

export type SyncSnapshot = {
  storage: Record<string, string>;
  todos: TodoWorkspace;
  capturedAt: number;
  deviceId: string;
  deviceName: string;
};

export type SyncRequestMessage = {
  type: "SYNC_REQUEST";
  requestId: string;
  snapshot: SyncSnapshot;
  snapshotHash: string;
  baseHash: string;
  originId: string;
  originName: string;
};

export type SyncResultMessage = {
  type: "SYNC_RESULT";
  requestId: string;
  status: "noop" | "applied_requester" | "apply_remote" | "conflict" | "force_apply_complete";
  snapshot?: SyncSnapshot;
  snapshotHash?: string;
  remoteDeviceId: string;
  remoteDeviceName: string;
  resolvedHash?: string;
};

export type FullSnapshotMessage = {
  type: "FULL_SNAPSHOT";
  snapshot: SyncSnapshot;
  snapshotHash: string;
  sourceId: string;
  sourceName: string;
};

export type ForceApplyMessage = {
  type: "FORCE_APPLY";
  requestId: string;
  snapshot: SyncSnapshot;
  snapshotHash: string;
  originId: string;
  originName: string;
};

export type HelloMessage = {
  type: "HELLO";
  deviceId: string;
  deviceName: string;
};

export type PeerMessage = SyncRequestMessage | SyncResultMessage | FullSnapshotMessage | ForceApplyMessage | HelloMessage;

export type ConnectionState = {
  lastResolvedHash: string;
  remoteDeviceId: string;
  remoteDeviceName: string;
};

export type PendingRequest = {
  peerId: string;
  localSnapshot: SyncSnapshot;
  localHash: string;
};

export type DifferingService = {
  id: string;
  name: string;
  keys: readonly string[];
  isTodos?: boolean;
  localSummary: string;
  remoteSummary: string;
};

export type ConflictState = {
  requestId: string;
  peerId: string;
  localSnapshot: SyncSnapshot;
  localHash: string;
  remoteSnapshot: SyncSnapshot;
  remoteHash: string;
  remoteDeviceName: string;
  differingServices: DifferingService[];
  resolutions: Record<string, "local" | "remote">;
};

export type SyncContextValue = {
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
  pairingOtp: string;
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
  connectWithOtp: (otp: string) => Promise<void>;
  handleReject: () => void;
  handleReceiverApproval: () => void;
  handleSenderApproval: (deviceId: string) => void;
  handleSenderReject: (deviceId: string) => void;
  disconnectSenderDevice: (deviceId: string) => void;
  requestManualSync: () => Promise<void>;
};
