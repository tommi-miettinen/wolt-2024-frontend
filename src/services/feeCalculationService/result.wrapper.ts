import { ZodError } from "zod";
import { DeliveryFeeInput } from ".";
import { getBulkFee, isRushHour, getFeeByDistance, getSmallOrderSurcharge, getDeliveryFee } from "./internal";

interface Result<T, E> {
  data: T;
  error?: E | null;
  success: boolean;
}

const ok = <T, E>(data: T): Result<T, E> => ({ data, success: true, error: null });
const err = <T, E extends Error>(error: E): Result<T, E> => ({ data: {} as T, success: false, error });

export const getSmallOrderSurchargeWrapper = (cartValue: number): Result<number, ZodError> => {
  try {
    return ok(getSmallOrderSurcharge(cartValue));
  } catch (error) {
    return err(error as ZodError);
  }
};

export const getDeliveryFeeWrapper = (deliveryFeeInput: DeliveryFeeInput): Result<number, ZodError> => {
  try {
    return ok(getDeliveryFee(deliveryFeeInput));
  } catch (error) {
    return err(error as ZodError);
  }
};

export const getBulkFeeWrapper = (itemCount: number): Result<number, ZodError> => {
  try {
    return ok(getBulkFee(itemCount));
  } catch (error) {
    return err(error as ZodError);
  }
};

export const isRushHourWrapper = (date: Date): Result<boolean, ZodError> => {
  try {
    return ok(isRushHour(date));
  } catch (error) {
    return err(error as ZodError);
  }
};

export const getFeeByDistanceWrapper = (distance: number): Result<number, ZodError> => {
  try {
    return ok(getFeeByDistance(distance));
  } catch (error) {
    return err(error as ZodError);
  }
};
