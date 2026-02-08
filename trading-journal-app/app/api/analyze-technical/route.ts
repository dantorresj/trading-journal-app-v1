import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { trades } = await request.json();

    if (!trades || trades.length < 10) {
      return NextResponse.json(
        { error: 'Se requieren al menos 10 trades para análisis' },
        { status: 400 }
      );
    }

    // Preparar datos para Claude
    const tradesData = trades.map((t: any) => ({
      fecha: t.fecha,
      activo: t.activo,
      setup: t.setup,
      horario: t.horario,
      direccion: t.direccion,
      resultado: t.resultado,
      ganancia_perdida: t.ganancia_perdida,
      hora_entrada: t.hora_entrada,
      contratos: t.contratos
    }));

    // Calcular estadísticas previas
    const totalTrades = trades.length;
    const winTrades = trades.filter((t: any) => t.resultado === 'Won').length;
    const winRate = ((winTrades / totalTrades) * 100).toFixed(1);

    // Llamar a Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Eres un analista experto de trading. Analiza estos ${totalTrades} trades y proporciona insights ESPECÍFICOS Y ACCIONABLES basados ÚNICAMENTE en los datos proporcionados.

DATOS DE TRADES:
${JSON.stringify(tradesData, null, 2)}

ESTADÍSTICAS GENERALES:
- Total trades: ${totalTrades}
- Win Rate: ${winRate}%

ANÁLISIS REQUERIDO (responde en JSON válido):

{
  "mejorHorario": {
    "sesion": "nombre de sesión con mejor win rate",
    "horario": "rango horario específico (ej: 09:30-11:00)",
    "winRate": número,
    "trades": número de trades en ese horario,
    "explicacion": "Por qué este horario es mejor (1-2 oraciones)"
  },
  "setupOptimo": {
    "nombre": "nombre del setup más rentable",
    "winRate": número,
    "pnlTotal": número,
    "profitFactor": número,
    "trades": número de trades con ese setup,
    "explicacion": "Por qué este setup funciona mejor (1-2 oraciones)"
  },
  "patronDetectado": {
    "titulo": "Título breve del patrón",
    "descripcion": "Descripción del patrón encontrado (2-3 oraciones)",
    "impacto": "Impacto en el rendimiento",
    "recomendacion": "Acción específica a tomar (1-2 oraciones)"
  }
}

IMPORTANTE:
- Basa TODO en los datos proporcionados, no inventes
- Sé específico con números y porcentajes
- Las recomendaciones deben ser ACCIONABLES
- Si un patrón no es claro, menciona "necesitas más datos"
- Responde SOLO con el JSON, sin texto adicional`
        }]
      })
    });

    if (!response.ok) {
      console.error('Claude API error:', await response.text());
      return NextResponse.json(
        { error: 'Error al analizar con IA' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Parsear respuesta JSON de Claude
    const insights = JSON.parse(content);

    return NextResponse.json(insights);

  } catch (error: any) {
    console.error('Error in technical analysis:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
