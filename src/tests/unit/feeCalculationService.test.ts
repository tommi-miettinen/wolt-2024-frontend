import { describe, it, expect } from "vitest";
import {
  getSmallOrderSurcharge,
  getFeeByDistance,
  getDeliveryFee,
  getBulkFee,
  isRushHour,
  MAX_FEE,
  FREE_CART_THRESHOLD,
  Distances,
  DistanceFees,
  SmallOrder,
} from "../../services/feeCalculationService";

//inspired by https://levelup.gitconnected.com/dry-your-unit-tests-with-dynamic-testing-d6df8c8bb83a

const MAX_DISTANCE = 10000;

const smallOrderTestCases = [
  {
    condition: `Cart value is exactly ${SmallOrder.MIN_VALUE}`,
    cartValue: SmallOrder.MIN_VALUE,
    expected: 0,
  },
  {
    condition: `Cart value is 1 over ${SmallOrder.MIN_VALUE}`,
    cartValue: SmallOrder.MIN_VALUE + 1,
    expected: 0,
  },
  {
    condition: `Cart value is 1 less than ${SmallOrder.MIN_VALUE}`,
    cartValue: SmallOrder.MIN_VALUE - 1,
    expected: 1,
  },
  {
    condition: `Cart value is 0.1`,
    cartValue: 0.1,
    expected: 9.9,
  },
];

describe(`If the cart value is less than ${SmallOrder.MIN_VALUE}€, a small order surcharge is added to the delivery price.
 The surcharge is the difference between the cart value and ${SmallOrder.MIN_VALUE}€.`, () => {
  smallOrderTestCases.forEach(({ condition, cartValue, expected }) => {
    it(`returns ${expected} when ${condition}`, () => {
      expect(getSmallOrderSurcharge(cartValue)).toBe(expected);
    });
  });
});

const distanceTestCases = [
  {
    condition: `Distance is less than ${Distances.BASE}`,
    distance: Distances.BASE - 1,
    expected: DistanceFees.BASE,
  },
  {
    condition: `Distance is exactly ${Distances.BASE}`,
    distance: Distances.BASE,
    expected: DistanceFees.BASE,
  },
  {
    condition: `Distance is ${Distances.BASE} + 1`,
    distance: Distances.BASE + 1,
    expected: DistanceFees.BASE + DistanceFees.ADDITIONAL,
  },
  {
    condition: `Distance is ${Distances.BASE + Distances.ADDITIONAL}`,
    distance: Distances.BASE + Distances.ADDITIONAL,
    expected: DistanceFees.BASE + DistanceFees.ADDITIONAL,
  },
];

describe("Fee by distance", () => {
  distanceTestCases.forEach(({ condition, distance, expected }) => {
    it(`returns ${expected} when ${condition}`, () => {
      expect(getFeeByDistance(distance)).toBe(expected);
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
      expect(getBulkFee(itemCount)).toBe(expected);
    });
  });
});

const deliveryFeeCases = [
  {
    condition: "throws on negative inputs",
    distance: -1,
    cartValue: 0,
    itemCount: 0,
    expected: "throw",
  },
  {
    condition: `Distance is ${Distances.BASE}m, cart value is 10€, 1 item`,
    distance: 1000,
    cartValue: 10,
    expected: 2,
  },
  {
    condition: `Cart value is over ${FREE_CART_THRESHOLD}€`,
    cartValue: FREE_CART_THRESHOLD,
    expected: 0,
  },
  {
    condition: `Delivery fee can never be more than ${MAX_FEE}€, including possible surcharges.`,
    distance: MAX_DISTANCE,
    expected: MAX_FEE,
  },
  {
    condition: `Delivery fee is multiplied by 1.2x during rush hour`,
    isRushHour: true,
    expected: 2.4,
  },
  {
    condition: `Delivery fee is multiplied by 1.2x during rush hour, but cannot exceed ${MAX_FEE}€`,
    distance: MAX_DISTANCE,
    itemCount: 1,
    isRushHour: true,
    expected: MAX_FEE,
  },
  {
    condition: `If cart value exceeds or equals ${FREE_CART_THRESHOLD}€, delivery is free. Rush hour does not affect this.`,
    cartValue: FREE_CART_THRESHOLD,
    isRushHour: true,
    expected: 0,
  },
];

describe("Delivery Fee", () => {
  deliveryFeeCases.forEach(({ condition, distance = 1, cartValue = SmallOrder.MIN_VALUE, itemCount = 1, isRushHour = false, expected }) => {
    it(`returns ${expected} when ${condition}`, () => {
      if (expected === "throw") {
        expect(() => getDeliveryFee({ distance, cartValue, itemCount, isRushHour })).toThrow();
        return;
      }

      expect(getDeliveryFee({ distance, cartValue, itemCount, isRushHour })).toBe(expected);
    });
  });
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
