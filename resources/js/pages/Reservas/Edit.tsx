import { useEffect } from 'react';

export default function ReservasEdit() {
    useEffect(() => {
        window.location.href = '/reservas';
    }, []);

    return null;
}
