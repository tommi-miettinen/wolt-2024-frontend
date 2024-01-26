import { z } from "zod";

const BULK_ITEMS_THRESHOLD_1 = 4;
const BULK_ITEMS_THRESHOLD_2 = 12;
const BULK_ITEMS_THRESHOLD_1_FEE = 0.5;
const BULK_ITEMS_THRESHOLD_2_FEE = 1.2;
const SMALL_ORDER_MINIMUM_VALUE = 10;
const MAX_DELIVERY_FEE = 15;
const FREE_DELIVERY_CART_THRESHOLD = 100;
const RUSH_HOUR_MULTIPLIER = 1.2;
const BASE_FEE = 2;
const DISTANCE_FEE_INTERVAL = 500;
const BASE_DELIVERY_FEE_DISTANCE_THRESHOLD = 1000;

/**
 * Calculates the bulk fee based on item count.
 * @param itemCount - The total number of items.
 * @returns  The bulk fee.
 */
export const calculateBulkFee = (itemCount: number) => {
  let fee = 0;

  const itemsBeyondTier1 = Math.max(itemCount - BULK_ITEMS_THRESHOLD_1, 0);
  const itemsBeyondTier2 = Math.max(itemCount - BULK_ITEMS_THRESHOLD_2, 0);

  fee += itemsBeyondTier1 * BULK_ITEMS_THRESHOLD_1_FEE;
  fee += itemsBeyondTier2 * BULK_ITEMS_THRESHOLD_2_FEE;
  return fee;
};

/**
 * Calculates the surcharge for small orders.
 * @param  cartValue - The total value of the cart.
 * @returns The surcharge amount.
 */
export const calculateSmallOrderSurcharge = (cartValue: number) => Math.max(0, SMALL_ORDER_MINIMUM_VALUE - cartValue);

/**
 * Calculates the delivery fee based on distance.
 * @param distance - The distance in meters.
 * @returns The delivery fee.
 */
export const calculateDeliveryFeeByDistance = (distance: number) => {
  if (distance <= BASE_DELIVERY_FEE_DISTANCE_THRESHOLD) return BASE_FEE;

  const distanceBeyondBaseThreshold = distance - BASE_DELIVERY_FEE_DISTANCE_THRESHOLD;
  const additionalFee = Math.ceil(distanceBeyondBaseThreshold / DISTANCE_FEE_INTERVAL);

  return BASE_FEE + additionalFee;
};

/**
 * Calculates the total delivery fee.
 * @param distance - Distance in meters.
 * @param cartValue - The value of the cart.
 * @param isRushHour - if true, applies the multiplier specified by RUSH_HOUR_MULTIPLIER to the fee.
 * @returns  - The total delivery fee.
 */
export const calculateDeliveryFee = (distance: number, cartValue: number, itemCount: number, isRushHour?: boolean) => {
  const validation = z
    .object({
      distance: z.number().positive(),
      cartValue: z.number().positive(),
      itemCount: z.number().positive(),
      isRushHour: z.boolean().optional(),
    })
    .safeParse({
      distance,
      cartValue,
      itemCount,
      isRushHour,
    });

  if (!validation.success) throw new Error(validation.error.message);

  if (cartValue >= FREE_DELIVERY_CART_THRESHOLD) return 0;

  let fee = 0;

  fee += calculateSmallOrderSurcharge(cartValue);
  fee += calculateDeliveryFeeByDistance(distance);
  fee += calculateBulkFee(itemCount);

  if (isRushHour) {
    fee = fee * RUSH_HOUR_MULTIPLIER;
  }

  return Math.min(MAX_DELIVERY_FEE, fee);
};

export const isRushHour = (datetime: string) => {
  const date = new Date(datetime);
  const hour = date.getHours();

  return hour >= 15 && hour <= 19;
};
