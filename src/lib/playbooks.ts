import { Finding } from "./ufm";

export interface PlaybookStep {
  title: string;
  description: string;
  priority: "critical" | "high" | "medium";
  estimatedTime: string;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  steps: PlaybookStep[];
}

export const getPlaybookForFinding = (finding: Finding): Playbook | null => {
  switch (finding.type) {
    case "breach":
      return BREACH_PLAYBOOK;
    
    case "ip_exposure":
      const port = finding.evidence.find(e => e.key.toLowerCase().includes('port'));
      if (port) {
        const portNum = Number(port.value);
        if (portNum === 23) return TELNET_PLAYBOOK;
        if (portNum === 3389) return RDP_PLAYBOOK;
        if (portNum === 445 || portNum === 139) return SMB_PLAYBOOK;
      }
      return IP_EXPOSURE_PLAYBOOK;
    
    case "domain_reputation":
      return DOMAIN_REP_PLAYBOOK;
    
    case "phone_intelligence":
      return PHONE_EXPOSURE_PLAYBOOK;
    
    default:
      return null;
  }
};

const BREACH_PLAYBOOK: Playbook = {
  id: "breach",
  name: "Data Breach Response",
  description: "Immediate actions for compromised credentials",
  steps: [
    {
      title: "Change Passwords Immediately",
      description: "Update passwords for all affected accounts. Use strong, unique passwords for each service.",
      priority: "critical",
      estimatedTime: "15-30 min"
    },
    {
      title: "Enable Two-Factor Authentication",
      description: "Add 2FA to all compromised accounts where available. Prefer authenticator apps over SMS.",
      priority: "critical",
      estimatedTime: "10-15 min"
    },
    {
      title: "Check for Account Activity",
      description: "Review login history and recent activity on all affected accounts for suspicious behavior.",
      priority: "high",
      estimatedTime: "10 min"
    },
    {
      title: "Update Security Questions",
      description: "Change security questions and answers to prevent account recovery attacks.",
      priority: "medium",
      estimatedTime: "5 min"
    }
  ]
};

const TELNET_PLAYBOOK: Playbook = {
  id: "telnet",
  name: "Telnet Port 23 Exposure",
  description: "Critical: Unencrypted remote access exposed",
  steps: [
    {
      title: "Disable Telnet Service",
      description: "Immediately disable the Telnet service. It transmits data in plaintext including passwords.",
      priority: "critical",
      estimatedTime: "5 min"
    },
    {
      title: "Enable SSH Instead",
      description: "Replace Telnet with SSH (port 22) for encrypted remote access. Configure with key-based auth.",
      priority: "critical",
      estimatedTime: "15 min"
    },
    {
      title: "Configure Firewall Rules",
      description: "Block port 23 at firewall level. Only allow SSH from trusted IP ranges.",
      priority: "high",
      estimatedTime: "10 min"
    }
  ]
};

const RDP_PLAYBOOK: Playbook = {
  id: "rdp",
  name: "RDP Port 3389 Exposure",
  description: "High risk: Remote Desktop publicly accessible",
  steps: [
    {
      title: "Restrict RDP Access",
      description: "Limit RDP to specific IP addresses using firewall rules. Never expose RDP to the entire internet.",
      priority: "critical",
      estimatedTime: "10 min"
    },
    {
      title: "Enable Network Level Authentication",
      description: "Turn on NLA (Network Level Authentication) to require authentication before session creation.",
      priority: "high",
      estimatedTime: "5 min"
    },
    {
      title: "Use VPN for Remote Access",
      description: "Set up VPN tunnel for remote access instead of direct RDP exposure.",
      priority: "high",
      estimatedTime: "30 min"
    },
    {
      title: "Monitor RDP Logs",
      description: "Review Windows Event Logs for failed login attempts and unauthorized access.",
      priority: "medium",
      estimatedTime: "10 min"
    }
  ]
};

const SMB_PLAYBOOK: Playbook = {
  id: "smb",
  name: "SMB Port 445/139 Exposure",
  description: "File sharing exposed to internet",
  steps: [
    {
      title: "Block SMB Ports Externally",
      description: "Close ports 445 and 139 on your firewall. SMB should never be internet-facing.",
      priority: "critical",
      estimatedTime: "5 min"
    },
    {
      title: "Disable SMBv1",
      description: "Ensure SMBv1 is disabled. Use SMBv3 or higher for local network file sharing.",
      priority: "high",
      estimatedTime: "5 min"
    },
    {
      title: "Review Share Permissions",
      description: "Audit all network shares and remove unnecessary permissions. Apply least privilege.",
      priority: "medium",
      estimatedTime: "15 min"
    }
  ]
};

const IP_EXPOSURE_PLAYBOOK: Playbook = {
  id: "ip_exposure",
  name: "IP Address Exposure",
  description: "Your IP and services are visible to scanners",
  steps: [
    {
      title: "Audit Open Ports",
      description: "Run nmap or similar tool to identify all open ports on your IP address.",
      priority: "high",
      estimatedTime: "10 min"
    },
    {
      title: "Close Unnecessary Services",
      description: "Disable services that don't need to be publicly accessible.",
      priority: "high",
      estimatedTime: "15 min"
    },
    {
      title: "Configure Firewall Rules",
      description: "Implement strict firewall rules to limit access to required services only.",
      priority: "medium",
      estimatedTime: "20 min"
    }
  ]
};

const DOMAIN_REP_PLAYBOOK: Playbook = {
  id: "domain_rep",
  name: "Domain Reputation Issues",
  description: "Your domain may be flagged or misconfigured",
  steps: [
    {
      title: "Check Email Authentication",
      description: "Verify SPF, DKIM, and DMARC records are properly configured to prevent spoofing.",
      priority: "high",
      estimatedTime: "20 min"
    },
    {
      title: "Review Blacklist Status",
      description: "Check if your domain/IP appears on email blacklists. Request delisting if necessary.",
      priority: "high",
      estimatedTime: "15 min"
    },
    {
      title: "Scan for Malware",
      description: "Run security scans to ensure your site hasn't been compromised or serving malicious content.",
      priority: "medium",
      estimatedTime: "30 min"
    }
  ]
};

const PHONE_EXPOSURE_PLAYBOOK: Playbook = {
  id: "phone_exposure",
  name: "Phone Number Exposure",
  description: "Your phone number appears in public databases",
  steps: [
    {
      title: "Review Public Listings",
      description: "Search for your number on data broker sites and request removal.",
      priority: "high",
      estimatedTime: "45 min"
    },
    {
      title: "Enable Carrier Security",
      description: "Contact your carrier to enable port-out protection and PIN verification.",
      priority: "high",
      estimatedTime: "15 min"
    },
    {
      title: "Limit Public Sharing",
      description: "Remove your phone number from social media profiles and public directories.",
      priority: "medium",
      estimatedTime: "20 min"
    }
  ]
};
