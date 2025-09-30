const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("./models/User"); // path to your User model

// Connect to your MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/yourDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkToken(email, tokenFromEmail) {
  try {
    // Hash the token from the email like your backend does
    const hashedToken = crypto.createHash("sha256").update(tokenFromEmail).digest("hex");

    // Find the user in DB
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log("Token in email (raw):", tokenFromEmail);
    console.log("Token in DB (hashed):", user.emailVerificationToken);
    console.log("Hashed token from email:", hashedToken);
    console.log("Token expires at:", user.emailVerificationTokenExpires);

    if (hashedToken === user.emailVerificationToken) {
      console.log("✅ Token matches DB!");
    } else {
      console.log("❌ Token does NOT match DB!");
    }

    if (user.emailVerificationTokenExpires < Date.now()) {
      console.log("❌ Token has expired");
    } else {
      console.log("✅ Token is still valid");
    }

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

// Replace these with the email and token from the verification email
checkToken("your-email@example.com", "TOKEN_FROM_EMAIL_LINK");
