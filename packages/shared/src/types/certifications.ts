export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
  badgeUrl?: string;
  credentialId?: string;
}
