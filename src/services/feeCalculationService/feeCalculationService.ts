import { ZodError } from "zod";
import { deliveryFeeInputSchema, DeliveryFeeInput, FeeServiceConfig } from "./schemas";

export const createFeeCalculationService = (config: FeeServiceConfig) => {
  const isRushHour = (date: Date) => {
    const validationResult = deliveryFeeInputSchema.shape.orderTime.safeParse(date);
    if (!validationResult.success) return validationResult.error;

    const day = date.getDay();
    const hour = date.getHours();
    return hour >= config.RUSH_HOUR_START_HOUR && hour < config.RUSH_HOUR_END_HOUR && day === config.RUSH_HOUR_DAY;
  };

  const getSmallOrderSurcharge = (cartValue: number) => {
    const validationResult = deliveryFeeInputSchema.shape.cartValue.safeParse(cartValue);
    if (!validationResult.success) return validationResult.error;

    return +Math.max(0, config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE - cartValue).toFixed(2);
  };

  const getBulkFee = (numberOfItems: number) => {
    const validationResult = deliveryFeeInputSchema.shape.numberOfItems.safeParse(numberOfItems);
    if (!validationResult.success) return validationResult.error;

    const itemsBeyondTier1 = Math.max(numberOfItems - config.BULK_ITEMS_TIER_1_THRESHOLD, 0);
    let fee = itemsBeyondTier1 * config.BULK_ITEMS_TIER_1_FEE;

    if (numberOfItems > config.BULK_ITEMS_TIER_2_THRESHOLD) {
      fee += config.BULK_ITEMS_TIER_2_FEE;
    }

    return +fee.toFixed(2);
  };

  const getFeeByDistance = (distance: number) => {
    const validationResult = deliveryFeeInputSchema.shape.distance.safeParse(distance);
    if (!validationResult.success) return validationResult.error;

    if (distance <= config.DISTANCE_AFTER_ADDITIONAL_FEE_STARTS) return config.INITIAL_DELIVERY_FEE;

    const distanceBeyondBase = distance - config.DISTANCE_AFTER_ADDITIONAL_FEE_STARTS;
    const intervalsOverBase = Math.ceil(distanceBeyondBase / config.ADDITIONAL_DISTANCE_INTERVAL);
    const additionalFee = intervalsOverBase * config.ADDITIONAL_DISTANCE_FEE;

    return +(config.INITIAL_DELIVERY_FEE + additionalFee).toFixed(2);
  };

  const getDeliveryFee = (deliveryFeeInput: DeliveryFeeInput) => {
    const validationResult = deliveryFeeInputSchema.safeParse(deliveryFeeInput);
    if (!validationResult.success) return validationResult.error;

    const { distance, cartValue, numberOfItems, orderTime } = validationResult.data;

    if (cartValue >= config.MIN_CART_VALUE_FOR_FREE_DELIVERY) return 0;

    const smallOrderSurcharge = getSmallOrderSurcharge(cartValue);
    if (smallOrderSurcharge instanceof ZodError) return smallOrderSurcharge;

    const feeByDistanceResult = getFeeByDistance(distance);
    if (feeByDistanceResult instanceof ZodError) return feeByDistanceResult;

    const bulkFeeResult = getBulkFee(numberOfItems);
    if (bulkFeeResult instanceof ZodError) return bulkFeeResult;

    const rushHourResult = isRushHour(orderTime);
    if (rushHourResult instanceof ZodError) return rushHourResult;

    let fee = feeByDistanceResult + bulkFeeResult + smallOrderSurcharge;

    if (rushHourResult) {
      fee = fee * config.RUSH_HOUR_FEE_MULTIPLIER;
    }

    return +Math.min(config.MAX_DELIVERY_FEE, fee).toFixed(2);
  };

  return {
    isRushHour,
    getSmallOrderSurcharge,
    getBulkFee,
    getFeeByDistance,
    getDeliveryFee,
  };
};
