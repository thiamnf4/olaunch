import { GuardrailInputSchema, GuardrailOutputSchema } from "@openlaunch/shared";
import { z } from "zod";

export function analyzeGuardrail(input: z.infer<typeof GuardrailInputSchema>) {

  const { errorRate, latencyP95, conversionDelta } = input;
  if (errorRate > 0.05) {
    return GuardrailOutputSchema.parse({ action: "rollback", reason: "Error rate above 5% baseline." });
  }
  if (latencyP95 > 800) {
    return GuardrailOutputSchema.parse({ action: "hold", reason: "Latency p95 too high; needs tuning." });
  }
  if (conversionDelta < -0.02) {
    return GuardrailOutputSchema.parse({ action: "hold", reason: "Negative conversion movement. Investigate first." });
  }
  return GuardrailOutputSchema.parse({ action: "increase", reason: "Within thresholds. Safe to increase rollout." });
}

/*
 Optional AI powered version (requires OpenAI API key)
 import OpenAI from "openai";

 const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

 export async function analyzeGuardrailAI(input: z.infer<typeof GuardrailInputSchema>) {
   const prompt = `
   You are a rollout safety assistant.
   Given these metrics, decide whether to "hold", "increase", or "rollback" the rollout.
   Explain briefly in one sentence.
   Metrics: ${JSON.stringify(input)}
   `;

   const res = await client.chat.completions.create({
     model: "gpt-4o-mini",
     messages: [{ role: "user", content: prompt }],
     temperature: 0.2,
     max_tokens: 120,
   });

   // Parsing & fallback
   const text = res.choices[0].message?.content ?? "";
   let action: "hold" | "increase" | "rollback" = "hold";
   if (text.toLowerCase().includes("increase")) action = "increase";
   else if (text.toLowerCase().includes("rollback")) action = "rollback";

   return GuardrailOutputSchema.parse({ action, reason: text.trim().slice(0, 200) });
 }
*/