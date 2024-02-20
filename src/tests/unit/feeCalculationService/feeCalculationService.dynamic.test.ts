import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import { createFeeCalculationService } from "../../../services/feeCalculationService/feeCalculationService";

const rn = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
const tf = (v: number) => +v.toFixed(2);
const rf = (min: number, max: number) => tf(Math.random() * (max - min) + min);

/*
Setting the minimum random value to 2 prevent validation errors.
Because testing with a value of 1 and subtracting 1 to test threshold conditions
might result in invalid inputs like 0 that would cause validation errors.
These threshold conditions are tested separately.
*/

const runTests = () => {
  const config = {
    CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE: rn(2, 20),
    MIN_CART_VALUE_FOR_FREE_DELIVERY: rn(20, 500),
    INITIAL_DELIVERY_FEE: rf(2, 3),
    MAX_DELIVERY_FEE: rn(3, 30),
    ADDITIONAL_DISTANCE_FEE: rf(0, 3),
    DISTANCE_AFTER_ADDITIONAL_FEE_STARTS: rn(2, 1e6),
    ADDITIONAL_DISTANCE_INTERVAL: rn(2, 1e6),
    RUSH_HOUR_START_HOUR: 15,
    RUSH_HOUR_END_HOUR: 19,
    RUSH_HOUR_DAY: 5,
    RUSH_HOUR_FEE_MULTIPLIER: rf(1, 3),
    BULK_ITEMS_TIER_1_THRESHOLD: rn(2, 10),
    BULK_ITEMS_TIER_2_THRESHOLD: rn(11, 20),
    BULK_ITEMS_TIER_1_FEE: rf(0, 3),
    BULK_ITEMS_TIER_2_FEE: rf(0, 3),
  };

  const { getSmallOrderSurcharge, getFeeByDistance, getBulkFee, getDeliveryFee, isRushHour } =
    createFeeCalculationService(config);

  const NOT_RUSH_HOUR_DATE = new Date("2021-10-01T14:59");
  const RUSH_HOUR_DATE = new Date("2021-10-01T15:01");

  const smallOrderSurchargeCases = [
    {
      description: "Works on floats",
      input: config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE - 1.11,
      expected: 1.11,
    },
    {
      description: "Works exactly at the threshold",
      input: tf(config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE),
      expected: 0,
    },
    {
      description: "Works on integers",
      input: config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE - 1,
      expected: 1,
    },
    {
      description: `Doesnt apply surcharge if the cart value is over ${config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE}€`,
      input: config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE + 0.01,
      expected: 0,
    },
    {
      description: "ZodError on non-positive inputs",
      input: 0,
      expected: "ZodError",
    },
    {
      description: "ZodError on negative inputs",
      input: -1,
      expected: "ZodError",
    },
    {
      description: "ZodError on invalid input types",
      input: "1",
      expected: "ZodError",
    },
  ];

  describe(`
If the cart value is less than ${config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE}€,
a small order surcharge is added to the delivery price.
The surcharge is the difference between the cart value and ${config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE}€.
`, () => {
    smallOrderSurchargeCases.forEach(({ description, input, expected }) => {
      if (expected === "ZodError") {
        // @ts-expect-error expecting error on invalid input
        return it(description, () => expect(getSmallOrderSurcharge(input)).toBeInstanceOf(ZodError));
      }
      it(description, () => expect(getSmallOrderSurcharge(input as number)).toBe(expected));
    });
  });

  const distanceFeeCases = [
    {
      description: `
      If distance is less than the base distance (${config.DISTANCE_AFTER_ADDITIONAL_FEE_STARTS} km),
      the delivery fee is ${config.INITIAL_DELIVERY_FEE}€`,
      input: 1,
      expected: config.INITIAL_DELIVERY_FEE,
    },
    {
      description: `If the delivery distance is ${
        config.DISTANCE_AFTER_ADDITIONAL_FEE_STARTS + config.ADDITIONAL_DISTANCE_INTERVAL + 1
      } meters, the delivery fee is ${config.INITIAL_DELIVERY_FEE + config.ADDITIONAL_DISTANCE_FEE * 2}€`,
      input: config.DISTANCE_AFTER_ADDITIONAL_FEE_STARTS + config.ADDITIONAL_DISTANCE_INTERVAL + 1,
      expected: tf(config.INITIAL_DELIVERY_FEE + config.ADDITIONAL_DISTANCE_FEE * 2),
    },
    {
      description: "Floats result in ZodError",
      input: 1.1,
      expected: "ZodError",
    },
    {
      description: "Distance cant be 0 meters, results in ZodError",
      input: 0,
      expected: "ZodError",
    },
    {
      description: "Distance cant be negative, results in ZodError",
      input: -1,
      expected: "ZodError",
    },
    {
      description: "Invalid input types result in ZodError",
      input: "1",
      expected: "ZodError",
    },
  ];

  describe(`Distance fee calculations`, () => {
    distanceFeeCases.forEach(({ description, input, expected }) => {
      if (expected === "ZodError") {
        // @ts-expect-error expecting error on invalid input
        return it(description, () => expect(getFeeByDistance(input)).toBeInstanceOf(ZodError));
      }
      it(description, () => expect(getFeeByDistance(input as number)).toBe(expected));
    });
  });

  const bulkFeeCases = [
    {
      description: `If the number of items is less than ${config.BULK_ITEMS_TIER_1_THRESHOLD}, no extra surcharge`,
      input: config.BULK_ITEMS_TIER_1_THRESHOLD - 1,
      expected: 0,
    },
    {
      description: "Floats result in ZodError",
      input: 1.1,
      expected: "ZodError",
    },
    {
      description: "Invalid input types result in ZodError",
      input: "1",
      expected: "ZodError",
    },
  ];

  describe(`Bulk fee calculations`, () => {
    bulkFeeCases.forEach(({ description, input, expected }) => {
      if (expected === "ZodError") {
        // @ts-expect-error expecting error on invalid input
        return it(description, () => expect(getBulkFee(input)).toBeInstanceOf(ZodError));
      }
      it(description, () => expect(getBulkFee(input as number)).toBe(expected));
    });
  });

  const validDefault = {
    distance: config.DISTANCE_AFTER_ADDITIONAL_FEE_STARTS,
    cartValue: config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE,
    numberOfItems: 1,
    orderTime: NOT_RUSH_HOUR_DATE,
  };

  const totalFeeCases = [
    {
      description: `The delivery fee can never be more than ${config.MAX_DELIVERY_FEE}€, including possible surcharges.`,
      input: {
        ...validDefault,
        cartValue: config.MIN_CART_VALUE_FOR_FREE_DELIVERY - 0.01,
        distance: Number.MAX_SAFE_INTEGER,
      },
      expected: config.MAX_DELIVERY_FEE,
    },
    {
      description: `The delivery is free (0€) when the cart value is equal or more than ${config.MIN_CART_VALUE_FOR_FREE_DELIVERY}€.`,
      input: { ...validDefault, cartValue: config.MIN_CART_VALUE_FOR_FREE_DELIVERY },
      expected: 0,
    },
    {
      description: `Normal fee calculation if cart is less than ${config.MIN_CART_VALUE_FOR_FREE_DELIVERY}€`,
      input: validDefault,
      expected: config.INITIAL_DELIVERY_FEE,
    },
    {
      description: "ZodError on invalid inputs",
      input: { ...validDefault, distance: 0 },
      expected: "ZodError",
    },
    {
      description: `Fee cant be over ${config.MAX_DELIVERY_FEE}€`,
      input: { ...validDefault, distance: Number.MAX_SAFE_INTEGER, numberOfItems: Number.MAX_SAFE_INTEGER },
      expected: config.MAX_DELIVERY_FEE,
    },
  ];

  describe("Total fee calculations", () => {
    totalFeeCases.forEach(({ description, input, expected }) => {
      if (expected === "ZodError") {
        it(description, () => expect(getDeliveryFee(input)).toBeInstanceOf(ZodError));
        return;
      }
      it(description, () => expect(getDeliveryFee(input)).toBe(expected));
    });
  });

  const rushHourCases = [
    {
      description: "Returns false when the date is before rush hour",
      input: NOT_RUSH_HOUR_DATE,
      expected: false,
    },
    {
      description: "Returns true when the date is during rush hour",
      input: RUSH_HOUR_DATE,
      expected: true,
    },
    {
      description: "Returns false when the date is after rush hour",
      input: new Date("2021-10-01T19:00"),
      expected: false,
    },
    {
      description: "Returns false when the date is on a different day",
      input: new Date("2021-10-02T15:00"),
      expected: false,
    },
    {
      description: "Returns ZodError on invalid dates",
      input: new Date("invalid date"),
      expected: "ZodError",
    },
  ];

  describe("Detects rush hour correctly, rush hour is on friday 3 - 7 PM UTC", () => {
    rushHourCases.forEach(({ description, input, expected }) => {
      if (expected === "ZodError") {
        return it(description, () => expect(isRushHour(input)).toBeInstanceOf(ZodError));
      }
      it(description, () => expect(isRushHour(input)).toBe(expected));
    });
  });

  const configCases = [
    {
      description: "Rush hour start hour must be less than rush hour end hour",
      input: { ...config, RUSH_HOUR_START_HOUR: 20, RUSH_HOUR_END_HOUR: 19 },
      expected: "Throw",
    },
    {
      description: "Bulk items tier 1 threshold must be less than bulk items tier 2 threshold",
      input: { ...config, BULK_ITEMS_TIER_1_THRESHOLD: 20, BULK_ITEMS_TIER_2_THRESHOLD: 19 },
      expected: "Throw",
    },
    {
      description: "Rush hour start hour must be between 0 and 23",
      input: { ...config, RUSH_HOUR_START_HOUR: 24 },
      expected: "Throw",
    },
    {
      description: "Rush hour end hour must be between 0 and 23",
      input: { ...config, RUSH_HOUR_END_HOUR: 24 },
      expected: "Throw",
    },
    {
      description: "Valid config",
      input: config,
    },
  ];

  describe("Config validation", () => {
    configCases.forEach(({ description, input, expected }) => {
      if (expected === "Throw") {
        return it(description, () => expect(() => createFeeCalculationService(input)).toThrow());
      }
      it(description, () => expect(() => createFeeCalculationService(input)).not.toThrow());
    });
  });
};

for (let i = 0; i < 100; i++) {
  runTests();
}
