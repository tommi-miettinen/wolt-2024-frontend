import { z } from "zod";

export const deliveryFeeInputSchema = z.object({
  distance: z.number().positive(),
  cartValue: z.number().positive(),
  numberOfItems: z.number().positive(),
  orderTime: z.date(),
});

type DeliveryFeeInput = z.infer<typeof deliveryFeeInputSchema>;

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

export const isRushHour = (date: Date) => {
  const validationResult = z.date().safeParse(date);
  if (!validationResult.success) return validationResult.error;

  const day = date.getDay();
  const hour = date.getHours();
  return hour >= RUSH_HOUR_START_HOUR && hour < RUSH_HOUR_END_HOUR && day === RUSH_HOUR_DAY;
};

export const getSmallOrderSurcharge = (cartValue: number) => {
  const validationResult = z.number().positive().safeParse(cartValue);
  if (!validationResult.success) return validationResult.error;

  return +Math.max(0, CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE - cartValue).toFixed(2);
};

export const getBulkFee = (numberOfItems: number) => {
  const validationResult = z.number().positive().safeParse(numberOfItems);
  if (!validationResult.success) return validationResult.error;

  const numberOfItemsRounded = Math.round(numberOfItems);

  const itemsBeyondTier1 = Math.max(numberOfItemsRounded - BULK_ITEMS_TIER_1_THRESHOLD, 0);
  let fee = itemsBeyondTier1 * BULK_ITEMS_TIER_1_FEE;

  if (numberOfItems > BULK_ITEMS_TIER_2_THRESHOLD) {
    fee += BULK_ITEMS_TIER_2_FEE;
  }

  return +fee.toFixed(2);
};

export const getFeeByDistance = (distance: number) => {
  const validationResult = z.number().positive().safeParse(distance);
  if (!validationResult.success) return validationResult.error;

  const distanceRounded = Math.round(distance);
  if (distanceRounded <= DISTANCE_AFTER_ADDITIONAL_FEE_STARTS) return INITIAL_DELIVERY_FEE;

  const distanceBeyondBase = distanceRounded - DISTANCE_AFTER_ADDITIONAL_FEE_STARTS;
  const intervalsOverBase = Math.ceil(distanceBeyondBase / ADDITIONAL_DISTANCE_INTERVAL);
  const additionalFee = intervalsOverBase * ADDITIONAL_DISTANCE_FEE;

  return +(INITIAL_DELIVERY_FEE + additionalFee).toFixed(2);
};

export const getDeliveryFee = (deliveryFeeInput: DeliveryFeeInput) => {
  const validationResult = z.object(deliveryFeeInputSchema.shape).safeParse(deliveryFeeInput);
  if (!validationResult.success) return validationResult.error;

  const { distance, cartValue, numberOfItems, orderTime } = validationResult.data;

  if (cartValue >= MIN_CART_VALUE_FOR_FREE_DELIVERY) return 0;

  let fee = 0;

  //Its safe to cast here because we validate at the start
  fee += getSmallOrderSurcharge(cartValue) as number;
  fee += getFeeByDistance(distance) as number;
  fee += getBulkFee(numberOfItems) as number;
  const rushHour = isRushHour(orderTime) as boolean;

  if (rushHour) {
    fee = fee * RUSH_HOUR_FEE_MULTIPLIER;
  }

  return +Math.min(MAX_DELIVERY_FEE, fee).toFixed(2);
};
