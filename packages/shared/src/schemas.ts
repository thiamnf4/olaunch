import { z } from "zod";

// Schema for creating a new feature flag
// Used when adding a flag in the admin UI or via API
export const FlagCreateSchema = z.object({
  key: z.string().min(1),
  description: z.string().optional(),
  enabled: z.boolean().default(false),
  percentage: z.number().int().min(0).max(100).default(0),
  variantJson: z.any().optional(),
  environmentId: z.string().min(1)
});

// Schema for updating an existing flag
// Same shape as create, but all fields optional and requires an id
export const FlagUpdateSchema = FlagCreateSchema.partial().extend({
  id: z.string().min(1)
});


// Schema used when evaluating whether a user should see a feature
// Takes in a user ID, environment, and flag key
export const EvaluateSchema = z.object({
  userId: z.string().min(1),
  environmentId: z.string().min(1),
  flagKey: z.string().min(1),
  attributes: z.record(z.string()).optional()
});

// Schema for the input metrics used by the guardrail analyzer
// These come from aggregated rollout data
export const GuardrailInputSchema = z.object({
  errorRate: z.number().min(0),
  latencyP95: z.number().min(0),
  conversionDelta: z.number(), // can be negative
});

// Schema for what the analyzer returns
export const GuardrailOutputSchema = z.object({
  action: z.enum(["hold", "increase", "rollback"]),
  reason: z.string()
});
