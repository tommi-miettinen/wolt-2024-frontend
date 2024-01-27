import { describe, it, expect } from "vitest";
import {
  calcSmallOrderSurcharge,
  calcDeliveryFeeByDistance,
  calcDeliveryFee,
  calcBulkFee,
  isRushHour,
  MAX_DELIVERY_FEE,
  FREE_DELIVERY_CART_THRESHOLD,
  DISTANCE_FEE_INTERVAL,
  BASE_DELIVERY_FEE_DISTANCE_THRESHOLD,
  SMALL_ORDER_MINIMUM_VALUE,
  BASE_FEE,
  FEE_AFTER_BASE_DISTANCE,
} from "../../services/feeCalculationService";

//inspired by https://levelup.gitconnected.com/dry-your-unit-tests-with-dynamic-testing-d6df8c8bb83a

const MAX_DISTANCE = 10000;

const smallOrderTestCases = [
  {
    condition: `Cart value is exactly ${SMALL_ORDER_MINIMUM_VALUE}`,
    cartValue: SMALL_ORDER_MINIMUM_VALUE,
    expected: 0,
  },
  {
    condition: `Cart value is 1 over ${SMALL_ORDER_MINIMUM_VALUE}`,
    cartValue: SMALL_ORDER_MINIMUM_VALUE + 1,
    expected: 0,
  },
  {
    condition: `Cart value is 1 less than ${SMALL_ORDER_MINIMUM_VALUE}`,
    cartValue: SMALL_ORDER_MINIMUM_VALUE - 1,
    expected: 1,
  },
  {
    condition: `Cart value is 0.1`,
    cartValue: 0.1,
    expected: 9.9,
  },
];

describe(`If the cart value is less than ${SMALL_ORDER_MINIMUM_VALUE}€, a small order surcharge is added to the delivery price.
 The surcharge is the difference between the cart value and ${SMALL_ORDER_MINIMUM_VALUE}€.`, () => {
  smallOrderTestCases.forEach(({ condition, cartValue, expected }) => {
    it(`returns ${expected} when ${condition}`, () => {
      expect(calcSmallOrderSurcharge(cartValue)).toBe(expected);
    });
  });
});

const distanceTestCases = [
  {
    condition: `Distance is less than ${BASE_DELIVERY_FEE_DISTANCE_THRESHOLD}`,
    distance: BASE_DELIVERY_FEE_DISTANCE_THRESHOLD - 1,
    expected: BASE_FEE,
  },
  {
    condition: `Distance is exactly ${BASE_DELIVERY_FEE_DISTANCE_THRESHOLD}`,
    distance: BASE_DELIVERY_FEE_DISTANCE_THRESHOLD,
    expected: BASE_FEE,
  },
  {
    condition: `Distance is ${BASE_DELIVERY_FEE_DISTANCE_THRESHOLD} + 1`,
    distance: BASE_DELIVERY_FEE_DISTANCE_THRESHOLD + 1,
    expected: BASE_FEE + FEE_AFTER_BASE_DISTANCE,
  },
  {
    condition: `Distance is ${BASE_DELIVERY_FEE_DISTANCE_THRESHOLD + DISTANCE_FEE_INTERVAL}`,
    distance: BASE_DELIVERY_FEE_DISTANCE_THRESHOLD + DISTANCE_FEE_INTERVAL,
    expected: BASE_FEE + FEE_AFTER_BASE_DISTANCE,
  },
];

describe("Fee by distance", () => {
  distanceTestCases.forEach(({ condition, distance, expected }) => {
    it(`returns ${expected} when ${condition}`, () => {
      expect(calcDeliveryFeeByDistance(distance)).toBe(expected);
    });
  });
});

const bulkFeeTestCases = [
  {
    condition: `Number of items is 4`,
    itemCount: 4,
    expected: 0,
  },
  {
    condition: `Number of items is 5`,
    itemCount: 5,
    expected: 0.5,
  },
  {
    condition: `Number of items is 10`,
    itemCount: 10,
    expected: 3,
  },
  {
    condition: `Number of items is 13`,
    itemCount: 13,
    expected: 5.7,
  },
  {
    condition: `Number of items is 14`,
    itemCount: 14,
    expected: 6.2,
  },
];

describe("Fee by item count", () => {
  bulkFeeTestCases.forEach(({ condition, itemCount, expected }) => {
    it(`returns ${expected} when ${condition}`, () => {
      expect(calcBulkFee(itemCount)).toBe(expected);
    });
  });
});

const deliveryFeeCases = [
  {
    condition: "throws on negative or invalid inputs",
    distance: 0,
    cartValue: 0,
    itemCount: 0,
    expected: "throw",
  },
  {
    condition: `Distance is ${BASE_DELIVERY_FEE_DISTANCE_THRESHOLD}m, cart value is 10€, 1 item`,
    distance: 1000,
    cartValue: 10,
    expected: 2,
  },
  {
    condition: `Cart value is over ${FREE_DELIVERY_CART_THRESHOLD}€`,
    cartValue: FREE_DELIVERY_CART_THRESHOLD,
    expected: 0,
  },
  {
    condition: `Delivery fee can never be more than ${MAX_DELIVERY_FEE}€, including possible surcharges.`,
    distance: MAX_DISTANCE,
    expected: MAX_DELIVERY_FEE,
  },
  {
    condition: `Delivery fee is multiplied by 1.2x during rush hour`,
    isRushHour: true,
    expected: 2.4,
  },
  {
    condition: `Delivery fee is multiplied by 1.2x during rush hour, but cannot exceed ${MAX_DELIVERY_FEE}€`,
    distance: MAX_DISTANCE,
    itemCount: 1,
    isRushHour: true,
    expected: MAX_DELIVERY_FEE,
  },
  {
    condition: `If cart value exceeds or equals ${FREE_DELIVERY_CART_THRESHOLD}€, delivery is free. Rush hour does not affect this.`,
    cartValue: FREE_DELIVERY_CART_THRESHOLD,
    isRushHour: true,
    expected: 0,
  },
];

describe("Delivery Fee", () => {
  deliveryFeeCases.forEach(
    ({ condition, distance = 1, cartValue = SMALL_ORDER_MINIMUM_VALUE, itemCount = 1, isRushHour = false, expected }) => {
      it(`returns ${expected} when ${condition}`, () => {
        if (expected === "throw") {
          expect(() => calcDeliveryFee({ distance, cartValue, itemCount, isRushHour })).toThrow();
          return;
        }

        expect(calcDeliveryFee({ distance, cartValue, itemCount, isRushHour })).toBe(expected);
      });
    }
  );
});

const rushHourCases = [
  { condition: `Before 3 PM`, datetime: "2021-10-01T14:59", expected: false },
  {
    condition: "Is exactly start of rush hour",
    datetime: "2021-10-01T15:00",
    expected: true,
  },
  {
    condition: "Is between 3 - 7 PM on friday",
    datetime: "2021-10-01T15:01",
    expected: true,
  },
  {
    condition: `Over 7PM`,
    datetime: "2021-10-01T19:01",
    expected: false,
  },
  {
    condition: `Not Friday`,
    datetime: "2021-09-01T18:00",
    expected: false,
  },
];

describe("Detects rush hour correctly, rush hour is on friday 3 - 7 PM UTC", () => {
  rushHourCases.forEach(({ condition, datetime, expected }) => {
    it(`returns ${expected} when ${condition}`, () => {
      expect(isRushHour(datetime)).toBe(expected);
    });
  });
});
