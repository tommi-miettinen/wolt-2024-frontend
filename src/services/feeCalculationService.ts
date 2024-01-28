import { z, ZodError } from "zod";

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
  date: Date;
}

export const isRushHour = (date: Date) => {
  z.date().parse(date);
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

/**
 * Uses the validateDeliveryFeeInput function to validate the input.
 * @throws {Error} Throws an error if the input validation fails.
 */
export const getDeliveryFee = (deliveryFeeInput: DeliveryFeeInput) => {
  const { distance, cartValue, itemCount, date } = deliveryFeeInput;

  z.object({
    distance: z.number().positive(),
    cartValue: z.number().positive(),
    itemCount: z.number().positive(),
    date: z.date(),
  }).parse(deliveryFeeInput);

  let fee = 0;

  if (cartValue >= FREE_CART_THRESHOLD) return fee;

  fee += getSmallOrderSurcharge(cartValue);
  fee += getFeeByDistance(distance);
  fee += getBulkFee(itemCount);

  if (isRushHour(date)) {
    fee = fee * RushHour.COST_MULTIPLIER;
  }

  return Math.min(MAX_FEE, fee);
};

type DeliveryFeeWithHooks = (
  input: DeliveryFeeInput,
  hooks: {
    onSuccess?: (fee: number) => void;
    onError?: (error: ZodError) => void;
  }
) => void;

export const deliveryFeeWithHooks: DeliveryFeeWithHooks = (deliveryFeeInput, hooks) => {
  const { onSuccess, onError } = hooks;
  try {
    onSuccess && onSuccess(getDeliveryFee(deliveryFeeInput));
  } catch (e) {
    onError && onError(e as ZodError);
  }
};

export const internals = {
  getSmallOrderSurcharge,
  getBulkFee,
  getFeeByDistance,
  isRushHour,
};
