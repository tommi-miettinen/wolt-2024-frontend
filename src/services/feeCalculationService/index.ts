import { createFeeCalculationService } from "./feeCalculationService";
export * from "./schemas";

export const feeCalculationService = createFeeCalculationService({
  CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE: 10,
  MIN_CART_VALUE_FOR_FREE_DELIVERY: 200,
  MAX_DELIVERY_FEE: 15,
  INITIAL_DELIVERY_FEE: 2,
  ADDITIONAL_DISTANCE_FEE: 1,
  DISTANCE_AFTER_ADDITIONAL_FEE_STARTS: 1000,
  ADDITIONAL_DISTANCE_INTERVAL: 500,
  RUSH_HOUR_START_HOUR: 15,
  RUSH_HOUR_END_HOUR: 19,
  RUSH_HOUR_DAY: 5,
  RUSH_HOUR_FEE_MULTIPLIER: 1.2,
  BULK_ITEMS_TIER_1_THRESHOLD: 4,
  BULK_ITEMS_TIER_2_THRESHOLD: 12,
  BULK_ITEMS_TIER_1_FEE: 0.5,
  BULK_ITEMS_TIER_2_FEE: 1.2,
});
