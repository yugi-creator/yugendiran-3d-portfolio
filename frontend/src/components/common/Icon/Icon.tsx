import type { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

function createIcon(paths: string[], viewBox = '0 0 24 24') {
  return function IconComponent({ size = 24, className, ...props }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        fill="currentColor"
        className={className}
        aria-hidden="true"
        {...props}
      >
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    );
  };
}

function createStrokeIcon(paths: string[], viewBox = '0 0 24 24') {
  return function IconComponent({ size = 24, className, ...props }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...props}
      >
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    );
  };
}

/* Brand icons (filled) */
export const GitHubIcon = createIcon([
  'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z',
]);

export const LinkedInIcon = createIcon([
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
]);

/* UI icons (stroked) */
export const MailIcon = createStrokeIcon([
  'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z',
  'm22 6-10 7L2 6',
]);

export const MapPinIcon = createStrokeIcon([
  'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z',
  'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
]);

export const CalendarIcon = createStrokeIcon([
  'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z',
  'M16 2v4M8 2v4M3 10h18',
]);

export const ExternalLinkIcon = createStrokeIcon([
  'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
  'M15 3h6v6',
  'M10 14 21 3',
]);

export const DownloadIcon = createStrokeIcon([
  'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4',
  'M7 10l5 5 5-5',
  'M12 15V3',
]);

export const MenuIcon = createStrokeIcon(['M3 12h18M3 6h18M3 18h18']);

export const XIcon = createStrokeIcon(['M18 6 6 18', 'M6 6l12 12']);

export const ChevronDownIcon = createStrokeIcon(['M6 9l6 6 6-6']);

export const ArrowUpIcon = createStrokeIcon(['M12 19V5', 'M5 12l7-7 7 7']);

export const MonitorIcon = createStrokeIcon([
  'M20 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z',
  'M8 21h8M12 17v4',
]);

export const ServerIcon = createStrokeIcon([
  'M20 4H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z',
  'M20 13H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2z',
  'M6 8h.01M6 17h.01',
]);

export const BrainIcon = createStrokeIcon([
  'M12 2a5 5 0 0 1 5 5c0 1.1-.4 2.1-1 2.9.6.8 1 1.8 1 2.9a5 5 0 0 1-5 5 5 5 0 0 1-5-5c0-1.1.4-2.1 1-2.9-.6-.8-1-1.8-1-2.9a5 5 0 0 1 5-5z',
  'M12 2v20',
]);

export const BriefcaseIcon = createStrokeIcon([
  'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z',
  'M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2',
]);

export const AwardIcon = createStrokeIcon([
  'M12 2a7 7 0 0 0-7 7c0 3.87 7 13 7 13s7-9.13 7-13a7 7 0 0 0-7-7z',
  'M12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
]);

export const CodeIcon = createStrokeIcon(['M16 18l6-6-6-6', 'M8 6l-6 6 6 6']);
