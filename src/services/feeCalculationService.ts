import { z } from "zod";

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

export interface DeliveryFeeInput {
  distance: number;
  cartValue: number;
  itemCount: number;
  isRushHour?: boolean;
}

export const isRushHour = (datetime: string) => {
  const date = new Date(datetime);
  const day = date.getDay();
  const hour = date.getHours();
  return hour >= RushHour.START && hour < RushHour.END && day === RushHour.DAY;
};

const getSmallOrderSurcharge = (cartValue: number) => Math.max(0, SmallOrder.MIN_VALUE - cartValue);

const getBulkFee = (itemCount: number) => {
  let fee = 0;

  const itemsBeyondTier1 = Math.max(itemCount - BulkItems.TIER_1, 0);
  fee += itemsBeyondTier1 * BulkItems.TIER_1_FEE;

  if (itemCount > BulkItems.TIER_2) {
    fee += BulkItems.TIER_2_FEE;
  }

  return fee;
};

const getFeeByDistance = (distance: number) => {
  if (distance <= Distances.BASE) return DistanceFees.BASE;

  const distanceBeyondBase = distance - Distances.BASE;
  const intervalsOverBase = Math.ceil(distanceBeyondBase / Distances.ADDITIONAL);
  const additionalFee = intervalsOverBase * DistanceFees.ADDITIONAL;

  return DistanceFees.BASE + additionalFee;
};

export const validateDeliveryFeeInput = (deliveryFeeInput: DeliveryFeeInput) => {
  return z
    .object({
      distance: z.number().nonnegative(),
      cartValue: z.number().nonnegative(),
      itemCount: z.number().nonnegative(),
      isRushHour: z.boolean().optional(),
    })
    .safeParse(deliveryFeeInput);
};

/**
 * Uses the validateDeliveryFeeInput function to validate the input.
 * @throws {Error} Throws an error if the input validation fails.
 */
export const getDeliveryFee = (deliveryFeeInput: DeliveryFeeInput) => {
  const validationResult = validateDeliveryFeeInput(deliveryFeeInput);
  if (!validationResult.success) throw new Error(validationResult.error.message);

  const { distance, cartValue, itemCount, isRushHour } = deliveryFeeInput;

  if (cartValue >= FREE_CART_THRESHOLD) return 0;

  let fee = 0;
  fee += getSmallOrderSurcharge(cartValue);
  fee += getFeeByDistance(distance);
  fee += getBulkFee(itemCount);
  if (isRushHour) fee = fee * RushHour.COST_MULTIPLIER;

  return Math.min(MAX_FEE, fee);
};

export const internals = {
  getSmallOrderSurcharge,
  getBulkFee,
  getFeeByDistance,
};
