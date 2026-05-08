import Razorpay from 'razorpay';
import crypto from 'crypto';
import Showtime from '../models/Showtime.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { sendBookingEmail } from '../utils/sendNotification.js';

//create order api
export const createOrder = async (req, res) => {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const { amount, showtimeId, selectedSeats } = req.body;

        if (!amount || isNaN(amount) || amount <= 0) {
            console.error("Invalid amount passed to createOrder:", amount);
            return res.status(400).json({ success: false, message: 'Invalid payment amount of ₹0. Please re-select seats.' });
        }

        const options = {
            amount: Math.round(amount * 100), //amount is in currency subunits(paise)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(), // We memorize EXACTLY who this is
                showtimeId: showtimeId,
                selectedSeats: selectedSeats.join(','), // Convert array to comma string "A1,A2"
                totalAmount: amount
            }
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Razorpay inner error:", error);
        res.status(500).json({ success: false, message: 'Error creating Razorpay order', detailedError: error });
    }
};

//verify payment api
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, showtimeId, selectedSeats, totalAmount } = req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // 🛡️ IDEMPOTENCY CHECK: Did the webhook already handle this payment?
            const existingBooking = await Booking.findOne({ razorpayOrderId: razorpay_order_id })
                .populate('movieId', 'title')
                .populate('theaterId', 'name');
            if (existingBooking) {
                // 📧 Still send email if webhook created the booking (fire-and-forget)
                const user = await User.findById(req.user._id);
                if (user?.email) {
                    sendBookingEmail(
                        user.email,
                        user.name,
                        existingBooking,
                        existingBooking.movieId?.title || 'Movie',
                        existingBooking.theaterId?.name || 'Theater'
                    );
                }
                return res.status(200).json({
                    success: true,
                    message: 'Payment verified and seats booked!',
                    bookingId: existingBooking._id
                });
            }

            // ✅ Payment is successful! Mark seats as Booked in DB.
            let bookingId = null;

            if (showtimeId && selectedSeats && selectedSeats.length > 0) {
                // 🛡️ Optimistic Locking: Only update if NONE of these seats are already 'Booked'
                const updateResult = await Showtime.updateOne(
                    {
                        _id: showtimeId,
                        "seatStatus": {
                            $not: {
                                $elemMatch: {
                                    seatNumber: { $in: selectedSeats },
                                    status: "Booked"
                                }
                            }
                        }
                    },
                    {
                        $set: {
                            "seatStatus.$[elem].status": "Booked",
                            "seatStatus.$[elem].bookedBy": req.user._id
                        },
                        $inc: {
                            totalSeatAvailable: -selectedSeats.length
                        }
                    },
                    {
                        arrayFilters: [{ "elem.seatNumber": { $in: selectedSeats } }]
                    }
                );

                if (updateResult.modifiedCount === 0) {
                    // This means the seats were already taken while the user was paying!
                    // Let's instantly refund their money via Razorpay API
                    try {
                        const razorpay = new Razorpay({
                            key_id: process.env.RAZORPAY_KEY_ID,
                            key_secret: process.env.RAZORPAY_KEY_SECRET,
                        });

                        await razorpay.payments.refund(razorpay_payment_id, {
                            amount: totalAmount * 100, // in paise
                            notes: { reason: 'Double booking prevented - Auto Refund' }
                        });

                        console.log(`Auto-refunded ₹${totalAmount} for payment ${razorpay_payment_id}`);

                    } catch (refundError) {
                        console.error('Failed to issue auto-refund:', refundError);
                        // In a real app, you would log this to a manual review queue
                    }

                    return res.status(400).json({
                        success: false,
                        message: "Double-booking prevented! The seats were claimed by someone else. A refund of ₹" + totalAmount + " has been auto-initiated."
                    });
                }

                // Get showtime details for booking record
                const showtime = await Showtime.findById(showtimeId);

                // Determine seat type for ticket color
                let seatType = 'Economy';
                if (showtime.seatStatus && selectedSeats.length > 0) {
                    // 1. Group selected seats by their tier
                    const tierCounts = { VIP: 0, Premium: 0, Economy: 0 };

                    selectedSeats.forEach(seatNum => {
                        const seat = showtime.seatStatus.find(s => s.seatNumber === seatNum);
                        if (seat && seat.seatType) {
                            tierCounts[seat.seatType] = (tierCounts[seat.seatType] || 0) + 1;
                        }
                    });

                    // 2. Find the max count
                    const maxCount = Math.max(tierCounts.VIP, tierCounts.Premium, tierCounts.Economy);

                    // 3. Resolve ties by tier priority: VIP > Premium > Economy
                    if (tierCounts.VIP === maxCount && maxCount > 0) {
                        seatType = 'VIP';
                    } else if (tierCounts.Premium === maxCount && maxCount > 0) {
                        seatType = 'Premium';
                    } else if (tierCounts.Economy === maxCount && maxCount > 0) {
                        seatType = 'Economy';
                    }
                }

                // Create booking record
                const booking = await Booking.create({
                    userId: req.user._id,
                    showtimeId: showtimeId,
                    movieId: showtime.movieId,
                    theaterId: showtime.theaterId,
                    seats: selectedSeats,
                    seatType: seatType,
                    totalAmount: totalAmount || 0,
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    status: 'Confirmed'
                });

                bookingId = booking._id;

                // 📧 Post-Booking Email Notification (fire-and-forget)
                const user = await User.findById(req.user._id);
                if (user?.email) {
                    sendBookingEmail(
                        user.email,
                        user.name,
                        booking,
                        showtime.movieId?.title || 'Movie',
                        showtime.theaterId?.name || 'Theater'
                    );
                }
            }

            res.status(200).json({ success: true, message: 'Payment verified and seats booked!', bookingId });
        } else {
            res.status(400).json({ success: false, message: "invalid Signature" });
        }
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ success: false, message: "Verification failed" });
    }
};

export const razorpayWebhook = async (req, res) => {
    try {
        // 1. Razorpay requires us to validate their cryptographic signature
        // Note: req.body MUST be a raw buffer string for crypto.createHmac to work perfectly!
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(req.body)// raw body string
            .digest('hex');

        if (expectedSignature !== signature) {
            return res.status(400).send('Invalid webhook signature');
        }

        // 2. Parse the body back to a JSON object now that it's verified
        const event = JSON.parse(req.body);

        // 3. Our target event: The money has successfully hit our Razorpay account!
        if (event.event === 'order.paid') {
            const payment = event.payload.payment.entity;
            const order_id = payment.order_id;
            const payment_id = payment.id;

            // Extract the truth payload we hid inside "notes" during Step
            const userId = payment.notes.userId;
            const showtimeId = payment.notes.showtimeId;
            const selectedSeats = payment.notes.selectedSeats.split(',');
            const totalAmount = payment.notes.totalAmount;

            // 4. Critical Idempotency Guard (Avoid Double Ticket Generation!)
            // Because React's verifyPayment ALSO creates a ticket, we must check if it already exists!
            const existingBooking = await Booking.findOne({ razorpayOrderId: order_id });
            if (existingBooking) {
                return res.status(200).send('Booking already processed successfully by frontend.');
            }

            //5. Apply the exact same Optimistic Locking you already built
            const updateResult = await Showtime.updateOne(
                {
                    _id: showtimeId,
                    "seatStatus": {
                        $not: { $elemMatch: { seatNumber: { $in: selectedSeats }, status: "Booked" } }
                    }
                },
                {
                    $set: { "seatStatus.$[elem].status": "Booked", "seatStatus.$[elem].bookedBy": userId },
                    $inc: { totalSeatAvailable: -selectedSeats.length }
                },
                { arrayFilters: [{ "elem.seatNumber": { $in: selectedSeats } }] }
            );
            if (updateResult.modifiedCount === 0) {
                console.log("WEBHOOK: Double booking blocked! Issuing auto-refund...");

                const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
                await razorpay.payments.refund(payment_id, { amount: payment.amount, notes: { reason: 'Webhook Auto-Refund' } });

                return res.status(200).send('Refunded');
            }
            // 6. Finally, generate the confirmed Database Ticket!
            const showtime = await Showtime.findById(showtimeId);
            await Booking.create({
                userId: userId,
                showtimeId: showtimeId,
                movieId: showtime.movieId,
                theaterId: showtime.theaterId,
                seats: selectedSeats,
                seatType: 'Economy', // Or parse from notes
                totalAmount: totalAmount,
                razorpayOrderId: order_id,
                razorpayPaymentId: payment_id,
                status: 'Confirmed'
            });
            console.log("WEBHOOK: Successfully secured movie tickets backstage!");
        }
        // Always reply 200 OK so Razorpay knows we received it
        res.status(200).json({ status: 'ok' });
    } catch (err) {
        console.error("Webhook Critical Failure:", err);
        res.status(500).send('Webhook failed');
    }
};