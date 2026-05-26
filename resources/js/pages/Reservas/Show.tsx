import { useEffect } from 'react';

export default function ReservasShow() {
    useEffect(() => {
        window.location.href = '/reservas';
    }, []);

    return null;
}
