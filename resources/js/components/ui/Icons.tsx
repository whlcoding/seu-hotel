// Tabler-style stroke icons — migrado do icons.jsx para TypeScript

interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    stroke?: number;
}

const Icon: React.FC<IconProps> = ({ children, size = 20, stroke = 1.75, ...rest }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...rest}
    >
        {children}
    </svg>
);

export const Dashboard: React.FC<IconProps> = (p) => <Icon {...p}><path d="M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z"/></Icon>;
export const Calendar:  React.FC<IconProps> = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></Icon>;
export const ArrowsLR:  React.FC<IconProps> = (p) => <Icon {...p}><path d="M3 8h13l-3-3M21 16H8l3 3"/></Icon>;
export const Users:     React.FC<IconProps> = (p) => <Icon {...p}><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M21 19c0-2.6-2-4.5-4.5-4.5"/></Icon>;
export const Star:      React.FC<IconProps> = (p) => <Icon {...p}><path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6L12 16.8 6.6 19.6l1-6L3.3 9.4l6-.9L12 3z"/></Icon>;
export const Chart:     React.FC<IconProps> = (p) => <Icon {...p}><path d="M3 3v18h18"/><path d="M7 15l3-4 3 2 4-7"/></Icon>;
export const Settings:  React.FC<IconProps> = (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>;
export const Hotel:         React.FC<IconProps> = (p) => <Icon {...p}><path d="M3 21h18M5 21V8l7-4 7 4v13M9 10h2M13 10h2M9 14h2M13 14h2M10 21v-4h4v4"/></Icon>;
export const ArrowDownTray: React.FC<IconProps> = (p) => <Icon {...p}><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"/></Icon>;
export const ArrowUpTray:   React.FC<IconProps> = (p) => <Icon {...p}><path d="M12 20V8m0 0l-4 4m4-4l4 4M4 4h16"/></Icon>;
export const Cash:      React.FC<IconProps> = (p) => <Icon {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 10v.01M18 14v.01"/></Icon>;
export const Refresh:   React.FC<IconProps> = (p) => <Icon {...p}><path d="M20 11A8 8 0 0 0 6.3 6.3L4 9M4 4v5h5"/><path d="M4 13a8 8 0 0 0 13.7 4.7L20 15M20 20v-5h-5"/></Icon>;
export const Search:    React.FC<IconProps> = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Icon>;
export const Bell:      React.FC<IconProps> = (p) => <Icon {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 0 0 4 0"/></Icon>;
export const Help:      React.FC<IconProps> = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 1-1 1.7V14M12 17v.01"/></Icon>;
export const ChevronDown:  React.FC<IconProps> = (p) => <Icon {...p}><path d="M6 9l6 6 6-6"/></Icon>;
export const ChevronLeft:  React.FC<IconProps> = (p) => <Icon {...p}><path d="M15 6l-6 6 6 6"/></Icon>;
export const ChevronRight: React.FC<IconProps> = (p) => <Icon {...p}><path d="M9 6l6 6-6 6"/></Icon>;
export const Menu:      React.FC<IconProps> = (p) => <Icon {...p}><path d="M4 6h16M4 12h16M4 18h16"/></Icon>;
export const PanelLeft: React.FC<IconProps> = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></Icon>;
export const Logout:    React.FC<IconProps> = (p) => <Icon {...p}><path d="M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></Icon>;
export const User:      React.FC<IconProps> = (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></Icon>;
export const Warning:   React.FC<IconProps> = (p) => <Icon {...p}><path d="M12 3L2 20h20L12 3z"/><path d="M12 10v4M12 17v.01"/></Icon>;
export const Clock:     React.FC<IconProps> = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
export const Check:     React.FC<IconProps> = (p) => <Icon {...p}><path d="M5 12l5 5L20 7"/></Icon>;
export const Plus:      React.FC<IconProps> = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
export const Sparkles:  React.FC<IconProps> = (p) => <Icon {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></Icon>;
export const Tools:     React.FC<IconProps> = (p) => <Icon {...p}><path d="M14 6l3-3 4 4-3 3M14 6L4 16v4h4L18 10M14 6l4 4"/></Icon>;
export const Broom:     React.FC<IconProps> = (p) => <Icon {...p}><path d="M16 2l6 6M14 4l6 6-9 9H5v-6l9-9zM7 17l3 3"/></Icon>;

// Alias conveniente — objeto com todos os ícones (compatível com a API original)
export const I = {
    Dashboard, Calendar, ArrowsLR, Users, Star, Chart, Settings,
    Hotel, ArrowDownTray, ArrowUpTray, Cash, Refresh, Search, Bell, Help,
    ChevronDown, ChevronLeft, ChevronRight, Menu, PanelLeft, Logout,
    User, Warning, Clock, Check, Plus, Sparkles, Tools, Broom,
} as const;

export type IconName = keyof typeof I;
