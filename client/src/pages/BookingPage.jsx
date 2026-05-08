import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { showtimeAPI, paymentAPI } from '../services/api';
import SeatGrid from '../components/SeatGrid';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export default function BookingPage() {
    const { showtimeId } = useParams();
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [lockedSeats, setLockedSeats] = useState([]);
    const [socket, setSocket] = useState(null);
    const [user, setUser] = useState(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Check if user is logged in
    useEffect(() => {
        api.get('/api/auth/me')
            .then(res => setUser(res.data.data))
            .catch(() => {
                toast.error('Please login to book tickets');
                navigate('/login');
            });
    }, [navigate]);

    // Socket.io Setup for real-time seat locking
    useEffect(() => {
        if (!user) return; // Wait until we know who the user is

        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
        const newSocket = io(socketUrl);
        setSocket(newSocket);

        newSocket.emit('join_showtime', showtimeId);

        newSocket.on('initial_locked_seats', (seats) => {
            setLockedSeats(seats);
        });

        newSocket.on('seat_locked', ({ seatNumber, userId }) => {
            if (userId !== user._id) {
                setLockedSeats(prev => [...new Set([...prev, seatNumber])]);
            }
        });

        newSocket.on('seat_unlocked', ({ seatNumber }) => {
            setLockedSeats(prev => prev.filter(s => s !== seatNumber));

            // If the user had it selected, it means their 10-minute Redis lock expired!
            setSelectedSeats(prev => {
                if (prev.includes(seatNumber)) {
                    // Fire the side-effect OUTSIDE the React render cycle to prevent crash
                    setTimeout(() => toast(`Your 10-minute hold on seat ${seatNumber} has expired!`, { icon: '⏱️' }), 0);
                    return prev.filter(s => s !== seatNumber);
                }
                return prev;
            });
        });

        newSocket.on('lock_failed', ({ seatNumber, message }) => {
            toast.error(`Seat ${seatNumber}: ${message}`);
            setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
        });

        return () => newSocket.disconnect();
    }, [showtimeId, user]);
    // Fetch showtime (includes seatStatus, movieId, theaterId populated)
    const { data: showtime, isLoading, error } = useQuery({
        queryKey: ['showtime', showtimeId],
        queryFn: async () => {
            const res = await showtimeAPI.getById(showtimeId);
            return res.data.data;
        },
    });
    const handleToggle = (seat) => {
        if (lockedSeats.includes(seat.seatNumber)) {
            toast.error("This seat was just locked by someone else!");
            return;
        }

        if (selectedSeats.includes(seat.seatNumber)) {
            // Unselecting -> Free the lock
            setSelectedSeats(prev => prev.filter(s => s !== seat.seatNumber));
            socket?.emit('unlock_seat', {
                showtimeId,
                seatNumber: seat.seatNumber,
                userId: user?._id
            });
        } else {
            // Anti-Abuse: Prevent frontend from selecting more than 10 seats
            if (selectedSeats.length >= 10) {
                toast.error("You can only book a maximum of 10 seats at a time.");
                return;
            }

            // Selecting -> Acquire the lock
            setSelectedSeats(prev => [...prev, seat.seatNumber]);
            socket?.emit('lock_seat', {
                showtimeId,
                seatNumber: seat.seatNumber,
                userId: user?._id
            });
        }
    };
    // Calculate total price defensively to prevent Razorpay crashes
    const totalPrice = selectedSeats.reduce((sum, seatNum) => {
        const seat = showtime?.seatStatus?.find(s => s.seatNumber === seatNum);
        if (!seat) return sum;

        let price = 250; // Fallback hardcoded economy price
        if (showtime?.pricing && seat?.seatType) {
            price = showtime.pricing[seat.seatType.toLowerCase()] || 250;
        }

        return sum + price;
    }, 0);
    if (isLoading) return (
        <div className="container section" style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div className="skeleton" style={{ width: '200px', height: '20px', margin: '0 auto 1rem' }} />
            <div className="skeleton" style={{ width: '80%', height: '400px', margin: '0 auto' }} />
        </div>
    );
    if (error) return (
        <div className="container section" style={{ textAlign: 'center', color: 'var(--red-light)', padding: '5rem 0' }}>
            ⚠️ Failed to load showtime. Make sure the backend is running.
        </div>
    );
    const movie = showtime.movieId;
    const theater = showtime.theaterId;

    const handlePayment = async () => {
        if (selectedSeats.length === 0) return;

        try {
            // 1. Extend locks for 5 minutes during payment checkout
            if (socket) {
                console.log("emitting extend_lock payload:", { showtimeId, userId: user?._id, seatNumbers: selectedSeats });
                socket.emit('extend_lock', { 
                    showtimeId, 
                    userId: user?._id, 
                    seatNumbers: selectedSeats 
                });
            } else {
                console.warn("socket is null, cannot emit extend_lock");
            }

            // 2. Create Order on Backend
            const { data } = await paymentAPI.createOrder({
                amount: totalPrice,
                showtimeId: showtimeId,
                selectedSeats: selectedSeats
            });

            // 3. Open Razorpay Checkout Window
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data.order.amount,
                currency: "INR",
                name: "Cinereserve Pro",
                description: `Booking for ${movie.title}`,
                order_id: data.order.id, // This is the order ID generated by backend
                handler: async function (response) {
                    // 3. This runs when payment is successful! Send details back to backend to verify.
                    try {
                        const verifyRes = await paymentAPI.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            showtimeId: showtimeId,
                            selectedSeats: selectedSeats,
                            totalAmount: totalPrice
                        });

                        if (verifyRes.data.success) {
                            // Clear selection and redirect to success page
                            setSelectedSeats([]);
                            queryClient.invalidateQueries({ queryKey: ['showtime', showtimeId] });
                            navigate(`/booking-success/${verifyRes.data.bookingId}`);
                        }
                    } catch (err) {
                        const errMsg = err.response?.data?.message || "Payment verification failed.";

                        // If our backend detected a double-booking (400 code), redirect to the friendly Failed Page
                        if (err.response?.status === 400) {
                            navigate('/booking-failed', { state: { message: errMsg, showtimeId: showtimeId } });
                        } else {
                            toast.error(errMsg, { duration: 5000 });
                            queryClient.invalidateQueries({ queryKey: ['showtime', showtimeId] });
                            setSelectedSeats([]);
                        }
                    }
                },
                theme: {
                    color: "#e50914" // Your app's primary red color
                }
            };

            if (!window.Razorpay) {
                alert("Razorpay SDK failed to load. Are you offline?");
                return;
            }

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error("Payment Failed", response.error);
                alert("Payment was aborted or failed. Try again.");
            });
            rzp.open();

        } catch (error) {
            console.error("Payment initialization failed:", error);
            if (error.response) {
                console.error("Backend Error Data:", error.response.data);
            }
            alert("Could not start payment. Check console for details.");
        }
    };

    return (
        <div className="container section">
            {/* Movie + Showtime Info Header */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {movie?.posterUrl && (
                    <img src={movie.posterUrl} alt={movie.title}
                        style={{ width: '80px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                )}
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{movie?.title}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {theater?.name} · {showtime.showTime}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <span className="badge badge-red">VIP ₹{showtime.pricing?.vip}</span>
                        <span className="badge badge-red" style={{ opacity: 0.7 }}>Premium ₹{showtime.pricing?.premium}</span>
                        <span className="badge badge-silver">Economy ₹{showtime.pricing?.economy}</span>
                    </div>
                </div>
            </div>
            {/* Seat Grid */}
            <SeatGrid
                seatStatus={showtime.seatStatus}
                pricing={showtime.pricing}
                selectedSeats={selectedSeats}
                lockedSeats={lockedSeats}
                onToggle={handleToggle}
            />
            {/* Bottom Bar — Selected Seats + Pay Button */}
            {selectedSeats.length > 0 && (
                <div style={{
                    position: 'sticky', bottom: '1rem',
                    marginTop: '1.5rem', padding: '1rem 1.5rem',
                    background: 'rgba(10,2,3,0.95)', backdropFilter: 'blur(16px)',
                    border: '1px solid var(--border-red)', borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '1rem',
                }}>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                            {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {selectedSeats.join(', ')}
                        </p>
                    </div>
                    <button onClick={handlePayment} className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
                        Pay ₹{totalPrice} →
                    </button>
                </div>
            )}
        </div>
    );
}