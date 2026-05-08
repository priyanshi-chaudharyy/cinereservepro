import nodemailer from 'nodemailer';

// Auto-detect SMTP config based on email domain
const getSmtpConfig = (email) => {
    const domain = email.split('@')[1]?.toLowerCase();

    const configs = {
        'gmail.com': { service: 'gmail' },
        'outlook.com': { host: 'smtp.office365.com', port: 587, secure: false },
        'hotmail.com': { host: 'smtp.office365.com', port: 587, secure: false },
        'yahoo.com': { host: 'smtp.mail.yahoo.com', port: 465, secure: true },
    };

    // Return known config or use a generic SMTP with common port
    return configs[domain] || { host: `smtp.${domain}`, port: 587, secure: false };
};

const smtpConfig = getSmtpConfig(process.env.EMAIL_USER || '');

const transporter = nodemailer.createTransport({
    ...smtpConfig,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

export const sendBookingEmail = async (userEmail, userName, booking, movieTitle, theaterName) => {
    try {
        const mailOptions = {
            from: `"CineReserve Pro" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Booking Confirmed - ${movieTitle}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a0a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a;">
                    
                    <!-- Gold Header Bar -->
                    <div style="background: linear-gradient(135deg, #e6c27a, #d4af37); padding: 20px; text-align: center;">
                        <h1 style="margin: 0; color: #0a0a0a; font-size: 22px; letter-spacing: 2px;">CINERESERVE <span style="font-weight: 900;">PRO</span></h1>
                    </div>

                    <!-- Body -->
                    <div style="padding: 30px; color: #fff;">
                        <p style="color: #10b981; font-size: 18px; font-weight: 700; margin-bottom: 5px;">Booking Confirmed!</p>
                        <p style="color: #999; font-size: 14px; margin-top: 0;">Hi ${userName}, your tickets are ready.</p>

                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <tr>
                                <td style="padding: 10px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Movie</td>
                                <td style="padding: 10px 0; color: #fff; font-size: 15px; font-weight: 700; text-align: right;">${movieTitle}</td>
                            </tr>
                            <tr style="border-top: 1px solid #222;">
                                <td style="padding: 10px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Theater</td>
                                <td style="padding: 10px 0; color: #fff; font-size: 14px; text-align: right;">${theaterName}</td>
                            </tr>
                            <tr style="border-top: 1px solid #222;">
                                <td style="padding: 10px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Seats</td>
                                <td style="padding: 10px 0; color: #e6c27a; font-size: 16px; font-weight: 800; text-align: right;">${booking.seats.join(', ')}</td>
                            </tr>
                            <tr style="border-top: 1px solid #222;">
                                <td style="padding: 10px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Amount</td>
                                <td style="padding: 10px 0; color: #10b981; font-size: 16px; font-weight: 700; text-align: right;">Rs. ${booking.totalAmount}</td>
                            </tr>
                        </table>

                        <p style="color: #555; font-size: 11px; margin-top: 20px;">Booking ID: ${booking._id}</p>
                    </div>

                    <!-- Footer -->
                    <div style="background: #111; padding: 15px; text-align: center;">
                        <p style="color: #666; font-size: 11px; margin: 0;">Enjoy the show! - CineReserve Pro</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Booking email sent to ${userEmail}: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error('Email send failed:', err.message);
        // Don't throw — notification failure should never block the booking flow
    }
};
