import { z } from "zod";

export const FeeServiceSchema = z
  .object({
    CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE: z.number().nonnegative().int(),
    MIN_CART_VALUE_FOR_FREE_DELIVERY: z.number().nonnegative().int(),
    MAX_DELIVERY_FEE: z.number().nonnegative().int().max(50, {
      message:
        "MAX_DELIVERY_FEE exceeds the sensible default max value of 50. Increase the max value in the schema if this is intentional.",
    }),
    INITIAL_DELIVERY_FEE: z.number().nonnegative().int(),
    ADDITIONAL_DISTANCE_FEE: z.number().nonnegative().int(),
    DISTANCE_AFTER_ADDITIONAL_FEE_STARTS: z.number().nonnegative().int(),
    ADDITIONAL_DISTANCE_INTERVAL: z.number().nonnegative().int(),
    RUSH_HOUR_START_HOUR: z.number().nonnegative().int().min(0).max(23),
    RUSH_HOUR_END_HOUR: z.number().nonnegative().int().min(0).max(23),
    RUSH_HOUR_DAY: z.number().nonnegative().int().min(0).max(6),
    RUSH_HOUR_FEE_MULTIPLIER: z.number().nonnegative().int(),
    BULK_ITEMS_TIER_1_THRESHOLD: z.number().nonnegative().int(),
    BULK_ITEMS_TIER_2_THRESHOLD: z.number().nonnegative().int(),
    BULK_ITEMS_TIER_1_FEE: z.number().nonnegative().max(5, {
      message:
        "BULK_ITEMS_TIER_1_FEE exceeds the sensible default max value of 5. Increase the max value in the schema if this is intentional.",
    }),
    BULK_ITEMS_TIER_2_FEE: z.number().nonnegative().max(5, {
      message:
        "BULK_ITEMS_TIER_2_FEE exceeds the sensible default max value of 5. Increase the max value in the schema if this is intentional.",
    }),
  })
  .refine((data) => data.RUSH_HOUR_START_HOUR < data.RUSH_HOUR_END_HOUR, {
    message: "RUSH_HOUR_START_HOUR must be less than RUSH_HOUR_END_HOUR",
    path: ["RUSH_HOUR_START_HOUR", "RUSH_HOUR_END_HOUR"],
  })
  .refine((data) => data.BULK_ITEMS_TIER_1_THRESHOLD < data.BULK_ITEMS_TIER_2_THRESHOLD, {
    message: "BULK_ITEMS_TIER_1_THRESHOLD must be less than BULK_ITEMS_TIER_2_THRESHOLD",
    path: ["BULK_ITEMS_TIER_1_THRESHOLD", "BULK_ITEMS_TIER_2_THRESHOLD"],
  });

export const deliveryFeeInputSchema = z.object({
  distance: z.number().positive().int().safe(),
  cartValue: z.number().positive().safe(),
  numberOfItems: z.number().positive().int(),
  orderTime: z.date(),
});

export type DeliveryFeeInput = z.infer<typeof deliveryFeeInputSchema>;
export type FeeServiceConfig = z.infer<typeof FeeServiceSchema>;
