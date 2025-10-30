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
