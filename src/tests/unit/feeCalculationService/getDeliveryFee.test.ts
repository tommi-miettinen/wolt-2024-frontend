import { describe, it, expect } from "vitest";
import { getDeliveryFee, MAX_FEE, FREE_CART_THRESHOLD, Distances, SmallOrder } from "../../../services/feeCalculationService";

//inspired by https://levelup.gitconnected.com/dry-your-unit-tests-with-dynamic-testing-d6df8c8bb83a

const MAX_DISTANCE = 10000;

const RUSH_HOUR_DATE = new Date("2021-10-01T15:01");
const NOT_RUSH_HOUR_DATE = new Date("2021-10-01T19:01");

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
    date: NOT_RUSH_HOUR_DATE,
    expected: 2,
  },
  {
    condition: `Cart value is over ${FREE_CART_THRESHOLD}€`,
    cartValue: FREE_CART_THRESHOLD + 1,
    expected: 0,
  },
  {
    condition: `Delivery fee can never be more than ${MAX_FEE}€, including possible surcharges.`,
    distance: MAX_DISTANCE,
    expected: MAX_FEE,
  },
  {
    condition: `Delivery fee is multiplied by 1.2x during rush hour`,
    date: RUSH_HOUR_DATE,
    expected: 2.4,
  },
  {
    condition: `Delivery fee is multiplied by 1.2x during rush hour, but cannot exceed ${MAX_FEE}€`,
    distance: MAX_DISTANCE,
    itemCount: 1,
    date: RUSH_HOUR_DATE,
    expected: MAX_FEE,
  },
  {
    condition: `If cart value equals ${FREE_CART_THRESHOLD}€, delivery is free. Rush hour does not affect this.`,
    cartValue: FREE_CART_THRESHOLD,
    date: RUSH_HOUR_DATE,
    expected: 0,
  },
];

describe("Delivery Fee", () => {
  deliveryFeeCases.forEach(
    ({ condition, distance = 1, cartValue = SmallOrder.MIN_VALUE, date = NOT_RUSH_HOUR_DATE, itemCount = 1, expected }) => {
      it(`returns ${expected} when ${condition}`, () => {
        if (expected === "throw") {
          expect(() => getDeliveryFee({ distance, cartValue, itemCount, date })).toThrow();
          return;
        }

        expect(getDeliveryFee({ distance, cartValue, itemCount, date })).toBe(expected);
      });
    }
  );
});
