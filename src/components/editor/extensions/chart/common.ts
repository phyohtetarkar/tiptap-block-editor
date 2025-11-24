import z from "zod";

const ChartConfigSchema = z.object({
  type: z.enum(["bar", "line", "doughnut", "pie", "polar", "radar"]),
  title: z.optional(z.string()),
  labelKey: z.string(),
  dataKey: z.optional(z.string()),
  groupKey: z.optional(z.string()),
});

const PropertySchema = z.object({
  default: z.optional(z.boolean()),
  id: z.string(),
  name: z.string(),
  type: z.enum(["text", "number", "date", "select"]),
  options: z.optional(z.array(z.string())),
});

const ChartDataSchema = z.object({
  config: ChartConfigSchema,
  properties: z.array(PropertySchema),
  data: z.array(
    z.record(z.string(), z.union([z.string(), z.number(), z.undefined()]))
  ),
});

export type Property = z.infer<typeof PropertySchema>;

export type ChartConfig = z.infer<typeof ChartConfigSchema>;

export type ChartData = z.infer<typeof ChartDataSchema>;

export function parseChartData(parsed: any) {
  return ChartDataSchema.safeParse(parsed);
}
