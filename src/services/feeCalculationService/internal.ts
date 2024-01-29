import { z } from "zod";
import { DeliveryFeeInput } from "./types";

export const CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE = 10;
export const MIN_CART_VALUE_FOR_FREE_DELIVERY = 200;

export const MAX_DELIVERY_FEE = 15;
export const INITIAL_DELIVERY_FEE = 2;
export const ADDITIONAL_DISTANCE_FEE = 1;

export const DISTANCE_AFTER_ADDITIONAL_FEE_STARTS = 1000;
export const ADDITIONAL_DISTANCE_INTERVAL = 500;

export const RUSH_HOUR_START_HOUR = 15;
export const RUSH_HOUR_END_HOUR = 19;
export const RUSH_HOUR_DAY = 5;
export const RUSH_HOUR_FEE_MULTIPLIER = 1.2;

export const BULK_ITEMS_TIER_1_THRESHOLD = 4;
export const BULK_ITEMS_TIER_2_THRESHOLD = 12;
export const BULK_ITEMS_TIER_1_FEE = 0.5;
export const BULK_ITEMS_TIER_2_FEE = 1.2;

/**
 * @throws {ZodError} On invalid dates.
 */
export const isRushHour = (date: Date) => {
  z.date().parse(date);
  const day = date.getDay();
  const hour = date.getHours();
  return hour >= RUSH_HOUR_START_HOUR && hour < RUSH_HOUR_END_HOUR && day === RUSH_HOUR_DAY;
};

/**
 * @throws {ZodError} On nonpositive numbers or otherwise invalid inputs
 **/
export const getSmallOrderSurcharge = (cartValue: number) => {
  z.number().positive().parse(cartValue);
  return +Math.max(0, CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE - cartValue).toFixed(2);
};

/**
 * @throws {ZodError} On nonpositive numbers or otherwise invalid inputs
 **/
export const getBulkFee = (itemCount: number) => {
  z.number().positive().parse(itemCount);

  const itemCountRounded = Math.round(itemCount);

  let fee = 0;

  const itemsBeyondTier1 = Math.max(itemCountRounded - BULK_ITEMS_TIER_1_THRESHOLD, 0);
  fee += itemsBeyondTier1 * BULK_ITEMS_TIER_1_FEE;

  if (itemCount > BULK_ITEMS_TIER_2_THRESHOLD) {
    fee += BULK_ITEMS_TIER_2_FEE;
  }

  return fee;
};

/**
 * @throws {ZodError} On nonpositive numbers or otherwise invalid inputs
 */
export const getFeeByDistance = (distance: number) => {
  z.number().positive().parse(distance);
  const distRounded = Math.round(distance);

  if (distRounded <= DISTANCE_AFTER_ADDITIONAL_FEE_STARTS) return INITIAL_DELIVERY_FEE;

  const distanceBeyondBase = distRounded - DISTANCE_AFTER_ADDITIONAL_FEE_STARTS;
  const intervalsOverBase = Math.ceil(distanceBeyondBase / ADDITIONAL_DISTANCE_INTERVAL);
  const additionalFee = intervalsOverBase * ADDITIONAL_DISTANCE_FEE;

  return INITIAL_DELIVERY_FEE + additionalFee;
};

/**
 * @throws {ZodError} Throws an error if the input does not conform to the following validation rules:
 *                 - `distance`, `cartValue`, and `itemCount` must be positive numbers.
 *                 - `date` must be a valid Date object.
 */
export const getDeliveryFee = (deliveryFeeInput: DeliveryFeeInput) => {
  z.object({
    distance: z.number().positive(),
    cartValue: z.number().positive(),
    itemCount: z.number().positive(),
    date: z.date(),
  }).parse(deliveryFeeInput);

  const { distance, cartValue, itemCount, date } = deliveryFeeInput;

  let fee = 0;

  if (cartValue >= MIN_CART_VALUE_FOR_FREE_DELIVERY) return fee;

  fee += getSmallOrderSurcharge(cartValue);
  fee += getFeeByDistance(distance);
  fee += getBulkFee(itemCount);

  if (isRushHour(date)) {
    fee = fee * RUSH_HOUR_FEE_MULTIPLIER;
  }

  return +Math.min(MAX_DELIVERY_FEE, fee).toFixed(2);
};
