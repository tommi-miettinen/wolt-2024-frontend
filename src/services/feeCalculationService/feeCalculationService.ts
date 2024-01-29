import { z } from "zod";

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
 * Determines if the given date falls within the rush hour period.
 * The rush hour is defined as a half-open interval [15:00, 19:00),
 * which means it includes 15:00 and all times up to, but not including, 19:00.
 *
 * @param {Date} date - The date and time to check.
 * @returns {boolean} - Returns true if the date is during rush hour, false otherwise.
 */
export const isRushHour = (date: Date) => {
  z.date().parse(date);
  const day = date.getDay();
  const hour = date.getHours();
  return hour >= RUSH_HOUR_START_HOUR && hour < RUSH_HOUR_END_HOUR && day === RUSH_HOUR_DAY;
};

/**
 * If the cart value is less than 10€, a small order surcharge is added to the delivery price.
 * The surcharge is the difference between the cart value and 10€.
 * @param cartValue cart value in euros, needs to be a positive number.
 * @throws {ZodError} On nonpositive numbers or otherwise invalid inputs.
 **/
export const getSmallOrderSurcharge = (cartValue: number) => {
  z.number().positive().parse(cartValue);
  return +Math.max(0, CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE - cartValue).toFixed(2);
};

/**
  Adds a fee of 0.5€ for every item beyond 4 items.
  Adds an additional fee of 1.2€ once if the number of items is over 12
 @param numberOfItems needs to be a positive integer
 @throws {ZodError} On nonpositive numbers or otherwise invalid inputs
 **/
export const getBulkFee = (numberOfItems: number) => {
  z.number().positive().parse(numberOfItems);
  const numberOfItemsRounded = Math.round(numberOfItems);

  const itemsBeyondTier1 = Math.max(numberOfItemsRounded - BULK_ITEMS_TIER_1_THRESHOLD, 0);
  let fee = itemsBeyondTier1 * BULK_ITEMS_TIER_1_FEE;

  if (numberOfItems > BULK_ITEMS_TIER_2_THRESHOLD) {
    fee += BULK_ITEMS_TIER_2_FEE;
  }

  return fee;
};

/**
 * 2€ for the first 1000 meters and then adds 1€ for every 500 meters.
 * @param distance Distance in meters, needs to be a positive number.
 * @returns The delivery fee by distance in euros.
 * @throws {ZodError} On nonpositive numbers or otherwise invalid inputs.
 */
export const getFeeByDistance = (distance: number) => {
  z.number().positive().parse(distance);
  const distRounded = Math.round(distance);

  if (distRounded <= DISTANCE_AFTER_ADDITIONAL_FEE_STARTS) return INITIAL_DELIVERY_FEE;

  const distanceBeyondBase = distRounded - DISTANCE_AFTER_ADDITIONAL_FEE_STARTS;
  const intervalsOverBase = Math.ceil(distanceBeyondBase / ADDITIONAL_DISTANCE_INTERVAL);
  const additionalFee = intervalsOverBase * ADDITIONAL_DISTANCE_FEE;

  return +(INITIAL_DELIVERY_FEE + additionalFee).toFixed(2);
};

export interface DeliveryFeeInput {
  distance: number;
  cartValue: number;
  numberOfItems: number;
  orderTime: Date;
}

/**
 * @param deliveryFeeInput
 * @property distance - Distance in meters, needs to be a positive number.
 * @property cartValue - Cart value in euros, needs to be a positive number.
 * @property numberOfItems - Number of items in the cart, needs to be a positive integer.
 * @property orderTime - Date object representing the time of the order, needs to be a valid Date object.
 * @returns The delivery fee in euros.
 * @throws {ZodError} On invalid inputs.
 */
export const getDeliveryFee = (deliveryFeeInput: DeliveryFeeInput) => {
  const { distance, cartValue, numberOfItems, orderTime } = z
    .object({
      distance: z.number().positive(),
      cartValue: z.number().positive(),
      numberOfItems: z.number().positive(),
      orderTime: z.date(),
    })
    .parse(deliveryFeeInput);

  if (cartValue >= MIN_CART_VALUE_FOR_FREE_DELIVERY) return 0;

  let fee = 0;

  fee += getSmallOrderSurcharge(cartValue);
  fee += getFeeByDistance(distance);
  fee += getBulkFee(numberOfItems);

  if (isRushHour(orderTime)) {
    fee = fee * RUSH_HOUR_FEE_MULTIPLIER;
  }

  return +Math.min(MAX_DELIVERY_FEE, fee).toFixed(2);
};
