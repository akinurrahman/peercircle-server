export const welcomeEmailTemplate = (fullName) => {
  const firstName = fullName.split(" ")[0];
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to PeerCircle!</title>
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
                <p style="margin-bottom: 20px; color: #4a4a4a; font-size: 16px;">Hey ${firstName}, welcome to the circle! 🎉</p>
                <p style="margin-bottom: 20px; color: #4a4a4a; font-size: 16px;">We're thrilled to have you join our academic social hub. Your journey to a more connected and resourceful college experience starts now!</p>
                <div style="background-color: #f0f0f0; border-left: 4px solid #6c5ce7; border-radius: 4px; padding: 20px; margin-bottom: 20px;">
                    <h2 style="color: #6c5ce7; font-size: 20px; margin: 0 0 10px;">Here's what you can do on PeerCircle:</h2>
                    <ul style="padding-left: 20px; margin-bottom: 0; color: #4a4a4a; font-size: 16px;">
                        <li>🤝 Connect with classmates and join study groups</li>
                        <li>📚 Buy and sell textbooks, notes, and academic supplies</li>
                        <li>🎉 Discover and share campus events</li>
                        <li>🌟 Showcase your academic achievements</li>
                        <li>💡 Collaborate on projects and share ideas</li>
                    </ul>
                </div>
                <p style="margin-bottom: 20px; color: #4a4a4a; font-size: 16px;">To get started, why not:</p>
                <ol style="padding-left: 20px; margin-bottom: 20px; color: #4a4a4a; font-size: 16px;">
                    <li>Complete your profile to help others find and connect with you</li>
                    <li>Join a study group for one of your current classes</li>
                    <li>List a textbook you no longer need in our marketplace</li>
                </ol>
                <p style="margin-bottom: 20px; color: #4a4a4a; font-size: 16px;">If you ever need help or have questions, our support team is just a click away. We're here to ensure you have the best possible experience on PeerCircle.</p>
                <p style="margin-bottom: 20px; color: #4a4a4a; font-size: 16px;">Ready to dive in? Click the button below to log in and start exploring!</p>
                <div style="text-align: center; margin-bottom: 20px;">
                    <a href="#" style="display: inline-block; padding: 12px 24px; background-color: #6c5ce7; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Start Exploring PeerCircle</a>
                </div>
                <p style="margin-bottom: 20px; color: #4a4a4a; font-size: 16px;">We're excited to see how you'll contribute to and benefit from our community!</p>
                <p style="margin-bottom: 0; color: #4a4a4a; font-size: 16px;">Happy connecting!</p>
                <p style="margin-bottom: 0; color: #4a4a4a; font-size: 16px;">The PeerCircle Team</p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f0f0f0; padding: 20px; text-align: center;">
                <p style="margin: 0 0 10px; font-size: 14px; color: #666;">© <span id="current-year"></span> PeerCircle. All rights reserved.</p>
                <p style="margin: 0; font-size: 12px; color: #888;">
                    You're receiving this email because you signed up for PeerCircle. 
                    If you believe this is an error, please contact our support team.
                </p>
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
