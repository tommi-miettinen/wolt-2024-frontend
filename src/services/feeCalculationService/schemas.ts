import { z } from "zod";

const maxErrorMsg = (max: number) =>
  `Value exceeds the sensible default max value of ${max}. Increase the max value in the schema if this is intentional.`;

export const FeeServiceSchema = z
  .object({
    CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE: z.number().min(0),
    MIN_CART_VALUE_FOR_FREE_DELIVERY: z
      .number()
      .min(0)
      .max(500, {
        message: maxErrorMsg(500),
      }),
    MAX_DELIVERY_FEE: z
      .number()
      .min(0)
      .max(30, {
        message: maxErrorMsg(30),
      }),
    INITIAL_DELIVERY_FEE: z
      .number()
      .min(0)
      .max(3, {
        message: maxErrorMsg(3),
      }),
    ADDITIONAL_DISTANCE_FEE: z
      .number()
      .min(0)
      .max(3, {
        message: maxErrorMsg(3),
      }),
    DISTANCE_AFTER_ADDITIONAL_FEE_STARTS: z.number().positive().int(),
    ADDITIONAL_DISTANCE_INTERVAL: z.number().positive().int(),
    RUSH_HOUR_START_HOUR: z.number().int().min(0).max(23),
    RUSH_HOUR_END_HOUR: z.number().int().min(0).max(23),
    RUSH_HOUR_DAY: z.number().int().min(0).max(6),
    RUSH_HOUR_FEE_MULTIPLIER: z
      .number()
      .min(1)
      .max(3, {
        message: maxErrorMsg(3),
      }),
    BULK_ITEMS_TIER_1_THRESHOLD: z.number().nonnegative().int(),
    BULK_ITEMS_TIER_2_THRESHOLD: z.number().nonnegative().int(),
    BULK_ITEMS_TIER_1_FEE: z
      .number()
      .min(0)
      .max(3, {
        message: maxErrorMsg(3),
      }),
    BULK_ITEMS_TIER_2_FEE: z
      .number()
      .min(0)
      .max(3, {
        message: maxErrorMsg(3),
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
