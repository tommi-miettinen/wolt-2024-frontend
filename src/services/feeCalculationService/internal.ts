import { z } from "zod";
import { DeliveryFeeInput } from "./types";

export const FREE_CART_THRESHOLD = 200;
export const MAX_FEE = 15;

export enum Distances {
  BASE = 1000,
  ADDITIONAL = 500,
}

export enum DistanceFees {
  BASE = 2,
  ADDITIONAL = 1,
}

export enum SmallOrder {
  MIN_VALUE = 10,
}

export enum RushHour {
  START = 15,
  END = 19,
  DAY = 5,
  COST_MULTIPLIER = 1.2,
}

export enum BulkItems {
  TIER_1 = 4,
  TIER_2 = 12,
  TIER_1_FEE = 0.5,
  TIER_2_FEE = 1.2,
}

/**
 * @throws {ZodError} On invalid dates.
 */
export const isRushHour = (date: Date) => {
  z.date().parse(date);
  const day = date.getDay();
  const hour = date.getHours();
  return hour >= RushHour.START && hour < RushHour.END && day === RushHour.DAY;
};

export const getSmallOrderSurcharge = (cartValue: number) => {
  z.number().positive().parse(cartValue);
  return +Math.max(0, SmallOrder.MIN_VALUE - cartValue).toFixed(2);
};

export const getBulkFee = (itemCount: number) => {
  z.number().positive().parse(itemCount);

  const itemCountRounded = Math.round(itemCount);

  let fee = 0;

  const itemsBeyondTier1 = Math.max(itemCountRounded - BulkItems.TIER_1, 0);
  fee += itemsBeyondTier1 * BulkItems.TIER_1_FEE;

  if (itemCount > BulkItems.TIER_2) {
    fee += BulkItems.TIER_2_FEE;
  }

  return fee;
};

export const getFeeByDistance = (distance: number) => {
  z.number().positive().parse(distance);
  const distRounded = Math.round(distance);

  if (distRounded <= Distances.BASE) return DistanceFees.BASE;

  const distanceBeyondBase = distRounded - Distances.BASE;
  const intervalsOverBase = Math.ceil(distanceBeyondBase / Distances.ADDITIONAL);
  const additionalFee = intervalsOverBase * DistanceFees.ADDITIONAL;

  return DistanceFees.BASE + additionalFee;
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

  if (cartValue >= FREE_CART_THRESHOLD) return fee;

  fee += getSmallOrderSurcharge(cartValue);
  fee += getFeeByDistance(distance);
  fee += getBulkFee(itemCount);

  if (isRushHour(date)) {
    fee = fee * RushHour.COST_MULTIPLIER;
  }

  return +Math.min(MAX_FEE, fee).toFixed(2);
};
