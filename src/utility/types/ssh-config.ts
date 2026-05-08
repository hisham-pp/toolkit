export interface SSHConfig {
  id: string;
  name: string;
  ip?: string;
  domain?: string;
  port: number;
  username: string;
  sshKey?: string;
  notes?: string;
  isActive: boolean;
  createdAt: number;
}
