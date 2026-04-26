import { NextRequest, NextResponse } from 'next/server';
import { calcularMetricas } from '@/lib/calcularMetricas';
import { Trade } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { trades } = await request.json();

    if (!trades || trades.length < 10) {
      return NextResponse.json(
        { error: 'Se requieren al menos 10 trades para análisis' },
        { status: 400 }
      );
    }

    // ── PRE-CALCULAR MÉTRICAS ──
    const metricas = calcularMetricas(trades as Trade[]);

    // ── LLAMAR A CLAUDE CON MÉTRICAS YA CALCULADAS ──
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
          content: `Eres un coach experto de trading. A continuación tienes métricas YA CALCULADAS de un trader real. 
Tu trabajo es interpretar estos números y dar feedback accionable y específico.
NO inventes datos. USA SOLO los números que te doy.

═══════════════════════════════════════
MÉTRICAS DEL TRADER
═══════════════════════════════════════

RESUMEN GLOBAL:
- Total trades: ${metricas.resumen.totalTrades}
- Win Rate: ${metricas.resumen.winRate}%
- Win Rate (con BE): ${metricas.resumen.winRateConBE}%
- P&L Total: $${metricas.resumen.pnlTotal}
- Profit Factor: ${metricas.resumen.profitFactor}
- Avg Win: $${metricas.resumen.avgWin}
- Avg Loss: $${metricas.resumen.avgLoss}
- Expected Value: $${metricas.resumen.expectedValue}
- R:R Promedio: ${metricas.resumen.rrPromedio ?? 'No disponible'}

WIN RATE POR DÍA DE SEMANA:
${Object.entries(metricas.porDiaSemana)
  .map(([dia, m]) => `- ${dia}: ${m.winRate}% (${m.trades} trades, P&L: $${m.pnl})`)
  .join('\n')}

MEJOR DÍA: ${metricas.mejorDia ? `${metricas.mejorDia.dia} (${metricas.mejorDia.winRate}%)` : 'Insuficientes datos'}
PEOR DÍA: ${metricas.peorDia ? `${metricas.peorDia.dia} (${metricas.peorDia.winRate}%)` : 'Insuficientes datos'}

RENDIMIENTO POR SETUP:
${Object.entries(metricas.porSetup)
  .map(([setup, m]) => `- ${setup}: WR ${m.winRate}%, uso ${m.frecuencia}% del tiempo, P&L $${m.pnl}, PF ${m.profitFactor}`)
  .join('\n')}

SETUP MÁS USADO: ${metricas.setupMasUsadoVsRentable?.masUsado ?? 'N/A'}
SETUP MÁS RENTABLE: ${metricas.setupMasUsadoVsRentable?.masRentable ?? 'N/A'}
¿SON EL MISMO?: ${metricas.setupMasUsadoVsRentable?.sonIguales ? 'Sí' : 'No'}

RENDIMIENTO POR HORARIO:
${Object.entries(metricas.porHorario)
  .map(([h, m]) => `- ${h}: WR ${m.winRate}% (${m.trades} trades, P&L: $${m.pnl})`)
  .join('\n')}

RENDIMIENTO POR DIRECCIÓN:
${Object.entries(metricas.porDireccion)
  .map(([d, m]) => `- ${d}: WR ${m.winRate}% (${m.trades} trades, P&L: $${m.pnl})`)
  .join('\n')}

RENDIMIENTO POR ACTIVO:
${Object.entries(metricas.porActivo)
  .map(([a, m]) => `- ${a}: WR ${m.winRate}% (${m.trades} trades, P&L: $${m.pnl})`)
  .join('\n')}

EJECUCIÓN:
- Cuando ejecutó bien (ejecute_bien=Si): WR ${metricas.porEjecucion.ejecutoBien.winRate}% (${metricas.porEjecucion.ejecutoBien.trades} trades, P&L: $${metricas.porEjecucion.ejecutoBien.pnl})
- Cuando ejecutó mal (ejecute_bien=No): WR ${metricas.porEjecucion.ejecutoMal.winRate}% (${metricas.porEjecucion.ejecutoMal.trades} trades, P&L: $${metricas.porEjecucion.ejecutoMal.pnl})

RACHAS DE PÉRDIDAS (análisis post ${metricas.rachas.rachaAnalizada} pérdidas consecutivas):
- Trades después de racha: WR ${metricas.rachas.despuesDeRacha.winRate}% (${metricas.rachas.despuesDeRacha.trades} trades, P&L: $${metricas.rachas.despuesDeRacha.pnl})
- Trades en condiciones normales: WR ${metricas.rachas.normal.winRate}% (${metricas.rachas.normal.trades} trades, P&L: $${metricas.rachas.normal.pnl})

═══════════════════════════════════════
INSTRUCCIONES DE ANÁLISIS
═══════════════════════════════════════

Responde ÚNICAMENTE con este JSON válido:

{
  "mejorHorario": {
    "sesion": "nombre del horario con mejor win rate o P&L",
    "winRate": número,
    "pnl": número,
    "trades": número,
    "explicacion": "Por qué este horario funciona mejor (1-2 oraciones con los números exactos)"
  },
  "setupOptimo": {
    "nombre": "nombre del setup más rentable",
    "winRate": número,
    "pnl": número,
    "frecuencia": número (% de uso),
    "profitFactor": número,
    "explicacion": "Análisis del setup con comparativa si no es el más usado"
  },
  "patronDetectado": {
    "titulo": "Título breve del patrón más relevante encontrado",
    "descripcion": "Descripción con números exactos del patrón (2-3 oraciones)",
    "impacto": "Impacto cuantificado en P&L o win rate",
    "recomendacion": "Acción concreta y específica que el trader debe tomar"
  },
  "alertas": [
    {
      "tipo": "oportunidad | riesgo",
      "mensaje": "Insight específico con números (ej: Tu win rate los lunes es X% menor que el resto)"
    }
  ],
  "resumenEjecucion": {
    "diferenciaWinRate": número (diferencia en % entre ejecutoBien vs ejecutoMal),
    "mensaje": "Análisis de cómo la ejecución afecta los resultados con números exactos"
  },
  "rachas": {
    "hayPatron": boolean,
    "mensaje": "Análisis de si el trader opera peor después de rachas de pérdidas, con números"
  }
}`
        }]
      })
    });

if (!response.ok) {
  const errorDetail = await response.text();
  console.error('Claude API error:', errorDetail);
  return NextResponse.json(
    { error: 'Error al analizar con IA', detail: errorDetail },
    { status: 500 }
  );
}

    const data = await response.json();
    const content = data.content[0].text;

    const insights = JSON.parse(content);

    // Adjuntar métricas crudas por si el frontend las necesita
    return NextResponse.json({ ...insights, _metricas: metricas });

  } catch (error: any) {
    console.error('Error in technical analysis:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
