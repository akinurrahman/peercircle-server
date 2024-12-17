export const verifyEmailOtpTemplate = (otp) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your PeerCircle Account</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; background-color: #f0f4f8; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #6c5ce7;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Welcome to PeerCircle!</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 30px;">
                <p style="margin-bottom: 20px; color: #4a4a4a; font-size: 16px;">Hey future PeerCircle star! 👋</p>
                <p style="margin-bottom: 20px; color: #4a4a4a; font-size: 16px;">We're excited to have you join our academic social hub! Before you start connecting with classmates and exploring the marketplace, let's quickly verify your email.</p>
                <div style="background-color: #f0f0f0; border-left: 4px solid #6c5ce7; border-radius: 4px; padding: 20px; text-align: center; margin-bottom: 20px;">
                    <p style="font-size: 18px; margin: 0; color: #4a4a4a;">Your verification code is:</p>
                    <h2 style="color: #6c5ce7; font-size: 36px; margin: 10px 0;">${otp}</h2>
                    <p style="font-size: 14px; color: #666; margin: 0;">This code is valid for the next 10 minutes.</p>
                </div>
                <p style="margin-bottom: 20px; color: #4a4a4a; font-size: 16px;">Once verified, you'll be all set to:</p>
                <ul style="padding-left: 20px; margin-bottom: 20px; color: #4a4a4a; font-size: 16px;">
                    <li>🤝 Connect with classmates and form study groups</li>
                    <li>📚 Buy and sell textbooks, notes, and other academic essentials</li>
                    <li>🎉 Discover campus events and activities</li>
                    <li>🌟 Share your academic journey and achievements</li>
                </ul>
                <p style="margin-bottom: 20px; color: #4a4a4a; font-size: 16px;">We can't wait for you to experience all the amazing features PeerCircle has to offer!</p>
                <p style="margin-bottom: 20px; color: #4a4a4a; font-size: 16px;">If you have any questions, our support team is here to help.</p>
                <p style="margin-bottom: 20px; color: #4a4a4a; font-size: 16px;">Happy connecting!</p>
                <p style="margin-bottom: 0; color: #4a4a4a; font-size: 16px;">The PeerCircle Team</p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f0f0f0; padding: 20px; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #666;">© <span id="current-year"></span> PeerCircle. All rights reserved.</p>
            </td>
        </tr>
    </table>
    <script>
        document.getElementById('current-year').textContent = new Date().getFullYear();
    </script>
</body>
</html>


  `;
};
