const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function fixStatus() {
  const snapshot = await db.collection("users").get();
  const batch = db.batch();
  let count = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (!data.status) {
      batch.update(doc.ref, { status: "active" });
      count++;
    }
  });

  await batch.commit();
  console.log(`✅ Corregidos ${count} usuarios sin status`);
}

fixStatus();