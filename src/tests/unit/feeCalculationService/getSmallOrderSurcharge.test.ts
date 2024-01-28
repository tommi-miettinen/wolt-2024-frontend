import { describe, it, expect } from "vitest";
import { internals, SmallOrder } from "../../../services/feeCalculationService";

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
      expect(internals.getSmallOrderSurcharge(cartValue)).toBe(expected);
    });
  });
});
