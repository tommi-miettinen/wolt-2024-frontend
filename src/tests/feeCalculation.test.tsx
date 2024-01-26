import { describe, it, expect } from "vitest";
import {
  calculateSmallOrderSurcharge,
  calculateDeliveryFeeByDistance,
  calculateDeliveryFee,
  calculateBulkFee,
} from "../services/feeCalculationService";

const MAX_DISTANCE = 10000;

describe("Small order surcharge", () => {
  it("Cart value is 10 so surcharge should be 0", () => {
    expect(calculateSmallOrderSurcharge(10)).toBe(0);
  });

  it("Cart value is 11 so surcharge should be 0", () => {
    expect(calculateSmallOrderSurcharge(11)).toBe(0);
  });

  it("Cart value is 9 so surcharge should be 1", () => {
    expect(calculateSmallOrderSurcharge(9)).toBe(1);
  });

  it("Cart value is 0 so surcharge should be 10", () => {
    expect(calculateSmallOrderSurcharge(0)).toBe(10);
  });
});

describe("Fee by distance", () => {
  it("A delivery fee for the first 1000 meters (=1km) is 2€", () => {
    expect(calculateDeliveryFeeByDistance(1000)).toBe(2);
  });

  it("1€ is added for every additional 500 meters", () => {
    expect(calculateDeliveryFeeByDistance(1499)).toBe(3);
  });

  it("1500m => 3€ fee", () => {
    expect(calculateDeliveryFeeByDistance(1500)).toBe(3);
  });

  it("Delivery distance is 1501 meters, the delivery fee is: 2€ base fee + 1€ for the first 500 m + 1€ for the second 500 m => 4€", () => {
    expect(calculateDeliveryFeeByDistance(1501)).toBe(4);
  });
});

describe("Fee by item count", () => {
  it("If the number of items is 4, no extra surcharge", () => {
    expect(calculateBulkFee(4)).toBe(0);
  });
  it("If the number of items is 5, 50 cents surcharge is added", () => {
    expect(calculateBulkFee(5)).toBe(0.5);
  });
  it("If the number of items is 10, 3€ surcharge (6 x 50 cents) is added", () => {
    expect(calculateBulkFee(10)).toBe(3);
  });
  it("If the number of items is 13, 5,70€ surcharge is added ((9 * 50 cents) + 1,20€)", () => {
    expect(calculateBulkFee(13)).toBe(5.7);
  });
});

describe("Delivery Fee", () => {
  it("Negative or invalid inputs should throw", () => {
    expect(() => calculateDeliveryFee(0, 0, 0)).toThrow();
    expect(() => calculateDeliveryFee(-1, -1, -1)).toThrow();
  });

  it("1000m, no surcharge => 2€", () => {
    expect(calculateDeliveryFee(1000, 10, 1)).toBe(2);
  });

  it("Max fee always 15€", () => {
    expect(calculateDeliveryFee(MAX_DISTANCE, 10, 1)).toBe(15);
  });

  it(">=100€ cart => 0€ fee", () => {
    const distance = 1;
    expect(calculateDeliveryFee(distance, 100, 1)).toBe(0);
    expect(calculateDeliveryFee(distance, 101, 1)).toBe(0);
    expect(calculateDeliveryFee(distance, 99, 1)).not.toBe(0);
  });

  it(`
  During the Friday rush, 3 - 7 PM, the delivery fee (the total fee including possible surcharges) will be multiplied by 1.2x.
  However, the fee still cannot be more than the max (15€).`, () => {
    expect(calculateDeliveryFee(MAX_DISTANCE, 10, 1, true)).toBe(15);
    expect(calculateDeliveryFee(1000, 100, 1, true)).toBe(0);
    expect(calculateDeliveryFee(1000, 10, 1, true)).toBe(2.4);
  });
});
