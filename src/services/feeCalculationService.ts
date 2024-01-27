import { z } from "zod";

export const BULK_ITEMS_THRESHOLD_1 = 4;
export const BULK_ITEMS_THRESHOLD_2 = 12;
export const BULK_ITEMS_THRESHOLD_1_FEE = 0.5;
export const BULK_ITEMS_THRESHOLD_2_FEE = 1.2;
export const SMALL_ORDER_MINIMUM_VALUE = 10;
export const MAX_DELIVERY_FEE = 15;
export const FREE_DELIVERY_CART_THRESHOLD = 200;
export const RUSH_HOUR_MULTIPLIER = 1.2;
export const BASE_FEE = 2;
export const FEE_AFTER_BASE_DISTANCE = 1;
export const DISTANCE_FEE_INTERVAL = 500;
export const BASE_DELIVERY_FEE_DISTANCE_THRESHOLD = 1000;

export const isRushHour = (datetime: string) => {
  z.string().parse(datetime);

  const date = new Date(datetime);
  const day = date.getDay();

  const hour = date.getHours();
  const isFriday = day === 5;

  return hour >= 15 && hour < 19 && isFriday;
};

export const calcBulkFee = (itemCount: number) => {
  z.number().positive().parse(itemCount);

  let fee = 0;

  const itemsBeyondTier1 = Math.max(itemCount - BULK_ITEMS_THRESHOLD_1, 0);
  fee += itemsBeyondTier1 * BULK_ITEMS_THRESHOLD_1_FEE;

  if (itemCount > BULK_ITEMS_THRESHOLD_2) {
    fee += BULK_ITEMS_THRESHOLD_2_FEE;
  }

  return fee;
};

export const calcSmallOrderSurcharge = (cartValue: number) => {
  z.number().positive().parse(cartValue);
  return Math.max(0, SMALL_ORDER_MINIMUM_VALUE - cartValue);
};

export const calcDeliveryFeeByDistance = (distance: number) => {
  z.number().positive().parse(distance);

  if (distance <= BASE_DELIVERY_FEE_DISTANCE_THRESHOLD) return BASE_FEE;

  const distanceBeyondBaseThreshold = distance - BASE_DELIVERY_FEE_DISTANCE_THRESHOLD;
  const intervalsOverBase = Math.ceil(distanceBeyondBaseThreshold / DISTANCE_FEE_INTERVAL);
  const additionalFee = intervalsOverBase * FEE_AFTER_BASE_DISTANCE;

  return BASE_FEE + additionalFee;
};

interface DeliveryFeeInput {
  distance: number;
  cartValue: number;
  itemCount: number;
  isRushHour?: boolean;
}

export const calcDeliveryFee = (deliveryFeeInput: DeliveryFeeInput) => {
  z.object({
    distance: z.number().positive(),
    cartValue: z.number().positive(),
    itemCount: z.number().positive(),
    isRushHour: z.boolean().optional(),
  }).parse(deliveryFeeInput);

  const { distance, cartValue, itemCount, isRushHour } = deliveryFeeInput;

  if (cartValue >= FREE_DELIVERY_CART_THRESHOLD) return 0;

  let fee = 0;

  fee += calcSmallOrderSurcharge(cartValue);
  fee += calcDeliveryFeeByDistance(distance);
  fee += calcBulkFee(itemCount);

  if (isRushHour) {
    fee = fee * RUSH_HOUR_MULTIPLIER;
  }

  return Math.min(MAX_DELIVERY_FEE, fee);
};
