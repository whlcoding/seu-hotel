import type { AvatarColor } from '@/types/hotel';

interface AvatarProps {
    name: string;
    color?: AvatarColor;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

function initials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
}

export default function Avatar({ name, color = '', size = 'md', className = '' }: AvatarProps) {
    const sizeClass = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : '';
    return (
        <div className={`avatar${color ? ` ${color}` : ''}${sizeClass ? ` ${sizeClass}` : ''} ${className}`}>
            {initials(name)}
        </div>
    );
}

export { initials };
