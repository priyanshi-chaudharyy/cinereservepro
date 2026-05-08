import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { bookingAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminScanner() {
    const { data: user, isLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const res = await api.get('/api/auth/me');
            return res.data.data;
        },
    });

    if (isLoading) return <div style={{ padding: '5rem', textAlign: 'center' }}>Loading scanner...</div>;

    if (!user || (user.role !== 'staff' && user.role !== 'admin' && user.role !== 'theater_admin')) {
        return <Navigate to="/" replace />;
    }

    return <ScannerUI />;
}

function ScannerUI() {
    const [scanResult, setScanResult] = useState(null);
    const [scanning, setScanning] = useState(true);

    useEffect(() => {
        // Ensure the container exists
        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        scanner.render(onScanSuccess, onScanFailure);

        async function onScanSuccess(decodedText) {
            if (!scanning) return; // Prevent multiple fires
            setScanning(false);
            scanner.pause(); // Pause scanning while we process

            try {
                // We expect QR format: CINERESERVE-PRO|{booking_id}
                const parts = decodedText.split('|');
                if (parts[0] !== 'CINERESERVE-PRO' || !parts[1]) {
                    toast.error('Invalid Ticket Format');
                    setTimeout(() => { setScanning(true); scanner.resume(); }, 2000);
                    return;
                }

                const bookingId = parts[1];
                
                // Call API
                const res = await bookingAPI.checkInBooking(bookingId);
                
                if (res.data.success) {
                    setScanResult({
                        success: true,
                        message: res.data.message,
                        data: res.data.data
                    });
                    toast.success('Ticket Verified!');
                }
            } catch (error) {
                setScanResult({
                    success: false,
                    message: error.response?.data?.message || 'Check-in failed'
                });
                toast.error('Check-in failed!');
            }
        }

        function onScanFailure(error) {
            // Ignore ongoing scan failures
        }

        return () => {
            scanner.clear().catch(error => console.error('Failed to clear scanner', error));
        };
    }, [scanning]);

    const resetScanner = () => {
        setScanResult(null);
        setScanning(true);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem' }}>QR Ticket Scanner</h1>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px', maxWidth: '500px', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div id="qr-reader" style={{ width: '100%', overflow: 'hidden', borderRadius: '8px' }}></div>
                    <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Point camera at the customer's QR ticket.
                    </p>
                </div>

                <div style={{ flex: 1, minWidth: '300px' }}>
                    {scanResult ? (
                        <div style={{
                            background: scanResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${scanResult.success ? '#10b981' : '#ef4444'}`,
                            padding: '2rem',
                            borderRadius: '12px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                                {scanResult.success ? '✅' : '❌'}
                            </div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: scanResult.success ? '#10b981' : '#ef4444' }}>
                                {scanResult.message}
                            </h2>

                            {scanResult.success && scanResult.data && (
                                <div style={{ marginTop: '1.5rem', textAlign: 'left', background: 'var(--bg-elevated)', padding: '1rem', borderRadius: '8px' }}>
                                    <p><strong>Movie:</strong> {scanResult.data.movie}</p>
                                    <p><strong>Time:</strong> {scanResult.data.time}</p>
                                    <p><strong>Seats:</strong> <span style={{ color: 'var(--red-light)', fontWeight: 'bold' }}>{scanResult.data.seats.join(', ')}</span></p>
                                </div>
                            )}

                            <button 
                                onClick={resetScanner}
                                className="btn-primary" 
                                style={{ marginTop: '2rem', width: '100%' }}
                            >
                                Scan Next Ticket
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            background: 'var(--bg-elevated)',
                            padding: '3rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            border: '1px dashed var(--border)'
                        }}>
                            <div style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }}>📷</div>
                            <p style={{ color: 'var(--text-secondary)' }}>Waiting for scan...</p>
                        </div>
                    )}
                </div>
            </div>
            
            <style>{`
                /* Override default html5-qrcode styles to match theme */
                #qr-reader {
                    border: none !important;
                }
                #qr-reader__scan_region {
                    background: black;
                }
                #qr-reader button {
                    background: var(--red-main) !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 16px !important;
                    border-radius: 4px !important;
                    cursor: pointer !important;
                    margin: 5px !important;
                }
                #qr-reader select {
                    background: var(--bg-elevated) !important;
                    color: white !important;
                    border: 1px solid var(--border) !important;
                    padding: 8px !important;
                    border-radius: 4px !important;
                }
                #qr-reader a {
                    color: var(--red-light) !important;
                }
            `}</style>
        </div>
    );
}
