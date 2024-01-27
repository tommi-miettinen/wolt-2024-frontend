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

enum RushHour {
  START = 15,
  END = 19,
  DAY = 5,
  COST_MULTIPLIER = 1.2,
}

enum BulkItems {
  TIER_1 = 4,
  TIER_2 = 12,
  TIER_1_FEE = 0.5,
  TIER_2_FEE = 1.2,
}

export const isRushHour = (datetime: string) => {
  const date = new Date(datetime);
  const day = date.getDay();

  const hour = date.getHours();
  const isRushHourDay = day === RushHour.DAY;

  return hour >= RushHour.START && hour < 19 && isRushHourDay;
};

export const getSmallOrderSurcharge = (cartValue: number) => Math.max(0, SmallOrder.MIN_VALUE - cartValue);

export const getBulkFee = (itemCount: number) => {
  let fee = 0;

  const itemsBeyondTier1 = Math.max(itemCount - BulkItems.TIER_1, 0);
  fee += itemsBeyondTier1 * BulkItems.TIER_1_FEE;

  if (itemCount > BulkItems.TIER_2) {
    fee += BulkItems.TIER_2_FEE;
  }

  return fee;
};

export const getFeeByDistance = (distance: number) => {
  if (distance <= Distances.BASE) return DistanceFees.BASE;

  const distanceBeyondBase = distance - Distances.BASE;
  const intervalsOverBase = Math.ceil(distanceBeyondBase / Distances.ADDITIONAL);
  const additionalFee = intervalsOverBase * DistanceFees.ADDITIONAL;

  return DistanceFees.BASE + additionalFee;
};

export const getDeliveryFee = (deliveryFeeInput: DeliveryFeeInput) => {
  const { distance, cartValue, itemCount, isRushHour } = deliveryFeeInput;

  if (cartValue >= FREE_CART_THRESHOLD) return 0;

  let fee = 0;
  fee += getSmallOrderSurcharge(cartValue);
  fee += getFeeByDistance(distance);
  fee += getBulkFee(itemCount);
  if (isRushHour) fee = fee * RushHour.COST_MULTIPLIER;

  return Math.min(MAX_FEE, fee);
};
