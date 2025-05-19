const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
require("dotenv").config()
admin.initializeApp();

// הכנס כאן את המפתח מ-SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// פונקציה לשליחת מייל
exports.sendEmailNotification = functions.https.onCall(async (data, context) => {
  const { to, subject, text } = data;

  console.log("📥 נתונים שהתקבלו:", data);
  console.log("📤 מייל לשליחה:", to);
  
  if (!to || typeof to !== 'string') {
    console.error("❌ לא התקבל אימייל תקין");
    throw new functions.https.HttpsError("invalid-argument", "אימייל לא תקין");
  }

  const msg = {
    to,
    from: "royye5869@gmail.com",  // חייב להיות מאומת ב־SendGrid
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error("❌ שגיאה בשליחת אימייל בפועל:", error.response?.body || error.message);
    throw new functions.https.HttpsError("internal", "שליחת אימייל נכשלה");
  }
});

