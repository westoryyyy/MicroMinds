import { z } from 'zod';

export const ListingRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  endpoint: z.string().url(),
  price_wei: z.string(), // numeric comes back as string from pg
  schema_input: z.record(z.unknown()),
  schema_output: z.record(z.unknown()),
  timeout_ms: z.number().int(),
  provider_address: z.string(),
  category: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.date(),
});

export type ListingRow = z.infer<typeof ListingRowSchema>;

export interface ListingSummary {
  id: string;
  name: string;
  description: string;
  priceWei: string;
  category: string | null;
  successRate: number;
  avgLatencyMs: number;
}

export interface ListingDetail extends ListingSummary {
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  timeoutMs: number;
  providerAddress: string;
  endpoint: string;
}
