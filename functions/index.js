import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onRequest, onCall } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import * as logger from 'firebase-functions/logger';
import admin from 'firebase-admin';
import sgMail from '@sendgrid/mail';
import corsLib from 'cors';
import twilio from 'twilio';
import { defineSecret } from "firebase-functions/params";

const TWILIO_ACCOUNT_SID = defineSecret("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = defineSecret("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = defineSecret("TWILIO_PHONE_NUMBER");

const getTwilioClient = () => {
  return twilio(
    TWILIO_ACCOUNT_SID.value(),
    TWILIO_AUTH_TOKEN.value()
  );
};




  const cors = corsLib({ origin: true });
  admin.initializeApp();


const db = admin.firestore();

setGlobalOptions({
  region: "us-central1",
  memory: "256MiB",
  timeoutSeconds: 60,
  secrets: [TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER],
});

export const sendEmailNotification = onCall(async (request) => {
  const { to, subject, text, html } = request.data;
  if (!to || typeof to !== "string") {
    throw new Error("אימייל לא תקין");
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to,
    from: "royye5869@gmail.com",
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    logger.error("שגיאה בשליחת מייל:", error);
    throw new Error("שליחת אימייל נכשלה");
  }
});

export const sendSmsNotification = onCall(
  async (request) => {
    const { to, message } = request.data;
    if (!to || !message) {
      throw new Error("מספר או הודעה חסרים");
    }

    const client = getTwilioClient();
   

    try {
      await client.messages.create({
        body: message,
        from: TWILIO_PHONE_NUMBER.value(),
        to,
      });
      return { success: true };
    } catch (error) {
      logger.error("שגיאה בשליחת SMS:", error);
      throw new Error("שליחת SMS נכשלה");
    }
  }
);



export const deleteUserAccount = onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { uid } = req.body;
    if (!uid) return res.status(400).send("חסר UID");

    try {
      await admin.auth().deleteUser(uid);
      res.status(200).json({ success: true });
    } catch (err) {
      logger.error("שגיאה במחיקה:", err);
      res.status(500).json({ error: "מחיקת המשתמש נכשלה" });
    }
  });
});

export const notifyOnNewQuestion = onDocumentCreated("questions/{questionId}", async (event) => {
  const client = getTwilioClient();
  const data = event.data?.data();
  if (!data) return;
  const { title, content, author, authorId, profileVisibility } = data;

  const usersSnap = await db.collection("users").get();
  const emailList = [];
  const smsList = []
  usersSnap.forEach(doc => {
    const user = doc.data();
    if (user?.settings?.emailNotifications && user?.email && user.uid !== authorId) {
      emailList.push({ email: user.email, displayName: user.displayName || "משתמש" });
    }
    if (user?.settings?.smsNotifications && user?.phone && user.uid !== authorId) {
      smsList.push({ phone: user.phone });
    }
  });

  const displayName = profileVisibility === false ? "משתמש אנונימי" : (author || "משתמש");
  const html = `
    <div dir="rtl" style="text-align:right; font-family:Arial, sans-serif;">
      <h3>שאלה חדשה פורסמה בקהילת הלמידה</h3>
      <p><strong>כותרת:</strong> ${title}</p>
      <p><strong>תוכן:</strong> ${content}</p>
      <p><strong>נשאל על ידי:</strong> ${displayName}</p>
      <p><a href="https://campusplus.com/community">מעבר לשאלה בקמפוס+</a></p>
    </div>
  `;

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  for (const user of emailList) {
    try {
      await sgMail.send({
        to: user.email,
        from: "royye5869@gmail.com",
        subject: "שאלה חדשה פורסמה בקמפוס+",
        html,
      });
    } catch (err) {
      logger.error("שגיאה בשליחת מייל לשאלה חדשה:", err.message);
    }
  }



const smsText = `שאלה חדשה: ${title}\nנשאל ע"י: ${displayName}`;

for (const user of smsList) {
  try {
    await client.messages.create({ body: smsText, from, to: user.phone });
  } catch (err) {
    logger.error("שגיאה בשליחת SMS לשאלה חדשה:", err.message);
  }
}
});

export const notifyOnSharedDocument = onDocumentUpdated("documents/{docId}", async (event) => {
  const client = getTwilioClient();
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after) return;

  const addedUsers = (after.sharedWith || []).filter(uid => !(before.sharedWith || []).includes(uid));
  if (addedUsers.length === 0) return;

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const docTitle = after.topic || "ללא נושא";
  const senderName = after.author || "משתמש";



  for (const uid of addedUsers) {
    const userSnap = await db.collection("users").doc(uid).get();
    const user = userSnap.data();
    if (!user) continue;

    const html = `
      <div dir="rtl" style="text-align:right; font-family:Arial, sans-serif;">
        <h3>מסמך אקדמי שותף איתך</h3>
        <p><strong>נושא:</strong> ${docTitle}</p>
        <p><strong>משתף:</strong> ${senderName}</p>
        <p><a href="https://campusplus.com/summaries">לצפייה במסמך</a></p>
      </div>
    `;

    try {
      if (user.settings?.emailNotifications && user.email) {
        await sgMail.send({
          to: user.email,
          from: "royye5869@gmail.com",
          subject: "מסמך אקדמי חדש שותף איתך בקמפוס+",
          html,
        });
      }

      if (user.settings?.smsNotifications && user.phone) {
        const smsText = `מסמך חדש בנושא "${docTitle}" שותף איתך ע"י ${senderName}`;
        await client.messages.create({ body: smsText, from, to: user.phone });
      }
    } catch (err) {
      logger.error("שגיאה בשליחת התראה על מסמך משותף:", err.message);
    }
  }
});


export const notifyOnQuestionReply = onDocumentUpdated("questions/{questionId}", async (event) => {
  const client = getTwilioClient();
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after) return;

  const beforeAnswers = before.answers || [];
  const afterAnswers = after.answers || [];
  if (afterAnswers.length <= beforeAnswers.length) return;

  const newAnswer = afterAnswers[afterAnswers.length - 1];
  const authorId = after.authorId;

  const userSnap = await db.collection("users").doc(authorId).get();
  const user = userSnap.data();
  if (!user || !user.email || !user.settings?.emailNotifications) return;

  const html = `
    <div dir="rtl" style="text-align:right; font-family:Arial, sans-serif;">
      <h3>תגובה חדשה לשאלה שלך</h3>
      <p><strong>כותרת:</strong> ${after.title}</p>
      <p><strong>תגובה:</strong> ${newAnswer.text || "תגובה ללא תוכן"}</p>
      <p><a href="https://campusplus.com/community">לצפייה בשאלה</a></p>
    </div>
  `;

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  try {
    await sgMail.send({
      to: user.email,
      from: "royye5869@gmail.com",
      subject: "תגובה חדשה לשאלה שלך בקמפוס+",
      html,
    });
  } catch (err) {
    logger.error("שגיאה בשליחת מייל על תגובה:", err.message);
  }

  if (user.settings?.smsNotifications && user.phone) {
 
  const smsText = `תגובה חדשה לשאלה "${after.title}": ${newAnswer.text || "תגובה"}`;

  try {
    await client.messages.create({ body: smsText, from, to: user.phone });
  } catch (err) {
    logger.error("שגיאה בשליחת SMS על תגובה:", err.message);
  }
}
});

export const notifyOnNewSummary = onDocumentCreated("documents/{docId}", async (event) => {
  const client = getTwilioClient();
 
  const data = event.data?.data();
  if (!data) return;

  const { topic, author, authorId } = data;

  const usersSnap = await db.collection("users").get();
  const emailList = [];
  usersSnap.forEach(doc => {
    const user = doc.data();
    if (user?.settings?.emailNotifications && user?.email && user.uid !== authorId) {
      emailList.push({ email: user.email, phone: user.phone, settings: user.settings });

    }
  });

  const html = `
    <div dir="rtl" style="text-align:right; font-family:Arial, sans-serif;">
      <h3>סיכום חדש הועלה</h3>
      <p><strong>נושא:</strong> ${topic}</p>
      <p><strong>מאת:</strong> ${author || "משתמש"}</p>
      <p><a href="https://campusplus.com/summaries">לצפייה בסיכומים</a></p>
    </div>
  `;

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  for (const user of emailList) {
  try {
    await sgMail.send({
      to: user.email,
      from: "royye5869@gmail.com",
      subject: "סיכום חדש הועלה בקמפוס+",
      html,
    });
  } catch (err) {
    logger.error("שגיאה בשליחת מייל על סיכום חדש:", err.message);
  }

  if (user.settings?.smsNotifications && user.phone) {
    const smsText = `סיכום חדש על "${topic}" הועלה ע"י ${author || "משתמש"}`;
    try {
      await client.messages.create({ body: smsText, from, to: user.phone });
    } catch (err) {
      logger.error("שגיאה בשליחת SMS על סיכום חדש:", err.message);
    }
  }
}
});
