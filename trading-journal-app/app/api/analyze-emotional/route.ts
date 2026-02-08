import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { reflexiones, recentTrades } = await request.json();

    if (!reflexiones || reflexiones.length === 0) {
      return NextResponse.json(
        { error: 'Se requieren reflexiones para análisis emocional' },
        { status: 400 }
      );
    }

    // Preparar datos para Claude
    const reflexionesData = reflexiones.map((r: any) => ({
      fecha: r.fecha,
      queBien: r.queBien,
      queMejorar: r.queMejorar,
      segunPlan: r.segunPlan,
      disciplina: r.disciplina,
      exitoso: r.exitoso
    }));

    const tradesData = recentTrades?.map((t: any) => ({
      fecha: t.fecha,
      resultado: t.resultado,
      ganancia_perdida: t.ganancia_perdida
    })) || [];

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
        max_tokens: 2500,
        messages: [{
          role: 'user',
          content: `Eres un psicólogo especializado en trading. Analiza estas reflexiones y detecta patrones emocionales.

REFLEXIONES (últimos 10 días):
${JSON.stringify(reflexionesData, null, 2)}

RESULTADOS DE TRADES RECIENTES:
${JSON.stringify(tradesData, null, 2)}

ANÁLISIS REQUERIDO (responde en JSON válido):

{
  "estadoEmocional": {
    "nivel": "MIEDO" | "ESTRES" | "EQUILIBRIO" | "CONFIANZA" | "SOBRECONFIANZA",
    "temperatura": número del 0-100 (0=mucho miedo, 50=equilibrio, 100=exceso confianza),
    "explicacion": "Explicación del estado detectado basado en las palabras usadas (2-3 oraciones)"
  },
  "patronEmocional": {
    "palabrasClave": ["palabra1", "palabra2", "palabra3"],
    "frecuencia": "con qué frecuencia aparecen",
    "impactoResultados": "cómo afectan al win rate (específico con datos)",
    "explicacion": "Relación entre emociones y resultados (2-3 oraciones)"
  },
  "insightDiaActual": {
    "tono": "positivo" | "neutro" | "negativo",
    "observacion": "Insight sobre la reflexión más reciente",
    "relacionConResultado": "Si el resultado del trade coincide con el tono emocional"
  },
  "tendenciaUltimos10Dias": {
    "evolucion": "mejorando" | "estable" | "deteriorando",
    "detalles": "Cómo ha cambiado el estado emocional (2-3 oraciones)",
    "alertas": ["alerta1 si existe", "alerta2 si existe"] o []
  },
  "recomendaciones": {
    "inmediatas": ["recomendación específica 1", "recomendación 2"],
    "mediano": ["acción para próximos días 1", "acción 2"],
    "frasesMotivacionales": ["frase motivadora 1", "frase 2", "frase 3"]
  }
}

DETECTA:
- Palabras como "frustrado", "ansioso", "presionado" → MIEDO/ESTRÉS
- Palabras como "fácil", "obvio", "siempre gano" → SOBRECONFIANZA  
- Palabras como "disciplinado", "paciente", "conforme" → EQUILIBRIO

RECOMENDACIONES SEGÚN ESTADO:
- MIEDO/ESTRÉS (0-30): Caminar, meditar, demo por días, frases tipo "las pérdidas son normales"
- EQUILIBRIO (40-60): Continuar, mantener disciplina, frases alentadoras
- SOBRECONFIANZA (70-100): Recordar plan, gestión de riesgo, no sobreoperar

Responde SOLO con JSON válido, sin texto adicional.`
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
    console.error('Error in emotional analysis:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
