import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Enviar email usando Resend
    const data = await resend.emails.send({
      from: 'KintEdge Soporte <onboarding@resend.dev>', // Dominio de Resend
      to: [process.env.SUPPORT_EMAIL || 'tu-email@example.com'], // Tu email personal
      replyTo: email, // Para que puedas responder directamente
      subject: `[Soporte KintEdge] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">Nuevo mensaje de soporte</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>De:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Asunto:</strong> ${subject}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-left: 4px solid #D4AF37;">
            <h3>Mensaje:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
          
          <p style="color: #666; font-size: 12px;">
            Este mensaje fue enviado desde el formulario de soporte de KintEdge.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message || 'Error al enviar el email' },
      { status: 500 }
    );
  }
}