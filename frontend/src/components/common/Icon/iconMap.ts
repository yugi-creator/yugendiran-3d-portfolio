import type React from 'react';
import type { IconProps } from './Icon';
import { MonitorIcon, ServerIcon, BrainIcon, CodeIcon, GitHubIcon, LinkedInIcon } from './Icon';

/** Maps skill category icon strings to components */
export const skillIconMap: Record<string, React.FC<IconProps>> = {
  monitor: MonitorIcon,
  server: ServerIcon,
  brain: BrainIcon,
  code: CodeIcon,
};

/** Maps social platform strings to components */
export const socialIconMap: Record<string, React.FC<IconProps>> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
};
