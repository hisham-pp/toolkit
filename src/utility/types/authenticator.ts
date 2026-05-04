import { LucideIcon } from "lucide-react";
import { OTPAlgorithm } from "../enums/otp-algorithm";
import { OTPEncoding } from "../enums/otp-encoding";

export interface Authenticator {
  id: string;
  issuer: string;
  account: string;
  secret: string;
  digits: number;
  period: number;
  algorithm: OTPAlgorithm;
  encoding: OTPEncoding;
  createdAt: number;
}

export interface ServicePreset {
  name: string;
  algorithm: OTPAlgorithm;
  digits: number;
  period: number;
  encoding: OTPEncoding;
  icon: LucideIcon;
}
