export interface SocialLink {
  platform: string;
  url: string;
  label: string;
}

export interface Profile {
  name: string;
  title: string;
  subtitle: string;
  bio: string[];
  location: string;
  email: string;
  socialLinks: SocialLink[];
  resumeUrl: string;
}
