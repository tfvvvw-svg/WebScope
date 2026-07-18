declare module "whois-json" {
  export interface WhoisRecord {
    domainName?: string;
    registrar?: string;
    createdDate?: string;
    expiresDate?: string;
    updatedDate?: string;
    nameServers?: string[];
    status?: string[];
    emails?: string[];
    registrant?: {
      organization?: string;
      country?: string;
    };
  }
  export default function whois(domain: string): Promise<WhoisRecord>;
}