import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Inicializa Firebase Admin solo una vez
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

// GET — obtener todos los usuarios (para tu panel de admin)
export async function GET() {
  try {
    const snapshot = await db
      .collection("users")
      .orderBy("createdAt", "desc")
      .get();

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || null,
      lastLogin: doc.data().lastLogin?.toDate().toISOString() || null,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}

// POST — crear documento cuando un usuario se registra
export async function POST(req: NextRequest) {
  try {
    const { uid, email, displayName, photoURL } = await req.json();

    if (!uid || !email) {
      return NextResponse.json({ error: "uid y email son requeridos" }, { status: 400 });
    }

    const userRef = db.collection("users").doc(uid);
    const existing = await userRef.get();

    // Si ya existe el documento no lo sobreescribimos
    if (existing.exists) {
      return NextResponse.json({ message: "Usuario ya existe" });
    }

    await userRef.set({
      uid,
      email,
      displayName: displayName || null,
      photoURL: photoURL || null,
      plan: "free",
      status: "active",
      role: "user",
      createdAt: FieldValue.serverTimestamp(),
      lastLogin: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}