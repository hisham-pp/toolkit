import { 
  ShieldCheck, 
  Monitor, 
  Globe, 
  Triangle, 
  Mail, 
  Cloud, 
  MessageSquare 
} from "lucide-react";
import { OTPAlgorithm } from "../enums/otp-algorithm";
import { OTPEncoding } from "../enums/otp-encoding";
import { ServicePreset } from "../types/authenticator";

export const SERVICE_PRESETS: ServicePreset[] = [
  { 
    name: "Custom", 
    algorithm: OTPAlgorithm.SHA1, 
    digits: 6, 
    period: 30, 
    encoding: OTPEncoding.Auto, 
    icon: ShieldCheck 
  },
  { 
    name: "GitHub", 
    algorithm: OTPAlgorithm.SHA1, 
    digits: 6, 
    period: 30, 
    encoding: OTPEncoding.Base32, 
    icon: Monitor 
  },
  { 
    name: "Google", 
    algorithm: OTPAlgorithm.SHA1, 
    digits: 6, 
    period: 30, 
    encoding: OTPEncoding.Base32, 
    icon: Globe 
  },
  { 
    name: "Vercel", 
    algorithm: OTPAlgorithm.SHA1, 
    digits: 6, 
    period: 30, 
    encoding: OTPEncoding.Base32, 
    icon: Triangle 
  },
  { 
    name: "Microsoft", 
    algorithm: OTPAlgorithm.SHA1, 
    digits: 6, 
    period: 30, 
    encoding: OTPEncoding.Base32, 
    icon: Mail 
  },
  { 
    name: "AWS", 
    algorithm: OTPAlgorithm.SHA1, 
    digits: 6, 
    period: 30, 
    encoding: OTPEncoding.Base32, 
    icon: Cloud 
  },
  { 
    name: "Discord", 
    algorithm: OTPAlgorithm.SHA1, 
    digits: 6, 
    period: 30, 
    encoding: OTPEncoding.Base32, 
    icon: MessageSquare 
  },
  { 
    name: "Facebook", 
    algorithm: OTPAlgorithm.SHA1, 
    digits: 6, 
    period: 30, 
    encoding: OTPEncoding.Base32, 
    icon: Globe 
  },
  { 
    name: "GitLab", 
    algorithm: OTPAlgorithm.SHA1, 
    digits: 6, 
    period: 30, 
    encoding: OTPEncoding.Base32, 
    icon: Globe 
  },
  { 
    name: "Cloudflare", 
    algorithm: OTPAlgorithm.SHA1, 
    digits: 6, 
    period: 30, 
    encoding: OTPEncoding.Base32, 
    icon: Globe 
  },
  { 
    name: "DigitalOcean", 
    algorithm: OTPAlgorithm.SHA1, 
    digits: 6, 
    period: 30, 
    encoding: OTPEncoding.Base32, 
    icon: Cloud 
  },
];
