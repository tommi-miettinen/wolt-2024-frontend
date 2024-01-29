import { describe, it, expect } from "vitest";
import {
  getSmallOrderSurcharge,
  getFeeByDistance,
  getBulkFee,
  getDeliveryFee,
  isRushHour,
  CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE,
} from "../../../services/feeCalculationService/internal";

const NOT_RUSH_HOUR_DATE = new Date("2021-10-01T14:59");
const RUSH_HOUR_DATE = new Date("2021-10-01T15:01");

describe(`If the cart value is less than 10€, a small order surcharge is added to the delivery price.
     The surcharge is the difference between the cart value and 10€.`, () => {
  it("Works on floats", () => {
    expect(getSmallOrderSurcharge(8.9)).toBe(1.1);
    expect(getSmallOrderSurcharge(9.9)).toBe(0.1);
    expect(getSmallOrderSurcharge(0.01)).toBe(9.99);
    expect(getSmallOrderSurcharge(0.009)).toBe(9.99);
  });

  it("Works on integers", () => {
    expect(getSmallOrderSurcharge(9)).toBe(1);
    expect(getSmallOrderSurcharge(8)).toBe(2);
  });

  it("Works on exactly at the threshold", () => {
    expect(getSmallOrderSurcharge(10)).toBe(0);
  });

  it("Throws on invalid inputs", () => {
    expect(() => getSmallOrderSurcharge(0)).toThrow();
    expect(() => getSmallOrderSurcharge(-1)).toThrow();
    // @ts-expect-error expecting error on invalid input
    expect(() => getSmallOrderSurcharge("1")).toThrow();
  });
});

describe(`A delivery fee for the first 1000 meters (=1km) is 2€. 
If the delivery distance is longer than that, 1€ is added for every additional 500 meters that 
the courier needs to travel before reaching the destination. 
Even if the distance would be shorter than 500 meters, the minimum fee is always 1€. `, () => {
  it("If the delivery distance is less than the base distance (1km), the delivery fee is 2€", () => {
    expect(getFeeByDistance(1)).toBe(2);
    expect(getFeeByDistance(999)).toBe(2);
  });

  it("If the delivery distance is 1499 meters, the delivery fee is 3€", () => {
    expect(getFeeByDistance(1499)).toBe(3);
  });

  it("If the delivery distance is 1500 meters, the delivery fee is 3€", () => {
    expect(getFeeByDistance(1500)).toBe(3);
  });

  it("If the delivery distance is 1501 meters, the delivery fee is 4€", () => {
    expect(getFeeByDistance(1501)).toBe(4);
  });

  it("If floats get through, they get rounded", () => {
    expect(getFeeByDistance(1499.9)).toBe(3);
    expect(getFeeByDistance(1500.4)).toBe(3);
    expect(getFeeByDistance(1501.5)).toBe(4);
  });

  it("Throws on invalid inputs", () => {
    expect(() => getFeeByDistance(0)).toThrow();
    expect(() => getFeeByDistance(-1)).toThrow();
    // @ts-expect-error expecting error on invalid input
    expect(() => getFeeByDistance("1")).toThrow();
  });
});

describe(`If the number of items is five or more, an additional 50 cent surcharge is added for each item above
 and including the fifth item. An extra "bulk" fee applies for more than 12 items of 1,20€.`, () => {
  it("If the number of items is less than 4, no extra surcharge", () => {
    expect(getBulkFee(3)).toBe(0);
  });

  it("If the number of items is 4, no extra surcharge", () => {
    expect(getBulkFee(4)).toBe(0);
  });

  it("If the number of items is 5, 50 cents surcharge is added", () => {
    expect(getBulkFee(5)).toBe(0.5);
  });

  it("If the number of items is 10, 3€ surcharge (6 x 50 cents) is added", () => {
    expect(getBulkFee(10)).toBe(3);
  });

  it("If the number of items is 13, 5.70€ surcharge is added ((9 * 50 cents) + 1.20€)", () => {
    expect(getBulkFee(13)).toBe(5.7);
  });

  it("If the number of items is 14, 6.20€ surcharge is added ((10 * 50 cents) + 1.20€)", () => {
    expect(getBulkFee(14)).toBe(6.2);
  });

  it("If floats somehow get through, they get rounded", () => {
    expect(getBulkFee(13.9)).toBe(6.2);
  });

  it("Throws on invalid inputs", () => {
    expect(() => getBulkFee(0)).toThrow();
    expect(() => getBulkFee(-1)).toThrow();
    // @ts-expect-error expecting error on invalid input
    expect(() => getBulkFee("1")).toThrow();
  });
});

describe("Total fee calculations", () => {
  it("The delivery fee can never be more than 15€, including possible surcharges.", () => {
    expect(getDeliveryFee({ distance: 100000, cartValue: 1, itemCount: 1, date: NOT_RUSH_HOUR_DATE })).toBe(15);
  });

  it("The delivery is free (0€) when the cart value is equal or more than 200€.", () => {
    expect(getDeliveryFee({ distance: 1, cartValue: 200, itemCount: 1, date: NOT_RUSH_HOUR_DATE })).toBe(0);
    expect(getDeliveryFee({ distance: 1, cartValue: 200.01, itemCount: 1, date: NOT_RUSH_HOUR_DATE })).toBe(0);
    expect(getDeliveryFee({ distance: 1, cartValue: 199.99, itemCount: 1, date: NOT_RUSH_HOUR_DATE })).toBe(2);
  });

  it("Throws on invalid inputs", () => {
    expect(() => getDeliveryFee({ distance: 0, cartValue: 0, itemCount: 0, date: NOT_RUSH_HOUR_DATE })).toThrow();
    expect(() => getDeliveryFee({ distance: -1, cartValue: -1, itemCount: -1, date: NOT_RUSH_HOUR_DATE })).toThrow();
    // @ts-expect-error expecting error on invalid input
    expect(() => getDeliveryFee({ distance: "1", cartValue: "1", itemCount: "1", date: new Date("invalid date") })).toThrow();
  });
});

describe(`During the Friday rush, 3 - 7 PM, the delivery fee (the total fee including possible surcharges) will be multiplied by 1.2x.
 However, the fee still cannot be more than the max (15€).`, () => {
  it("Fee cant still be over 15€", () => {
    expect(
      getDeliveryFee({ distance: 10000, cartValue: CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE, itemCount: 100, date: RUSH_HOUR_DATE })
    ).toBe(15);
  });

  it(`Cart value of 10€ (no small order surcharge) and a distance of 1 (2€ base fee applied)
     should result in 2€ basefee * 1.2 (rush hour multiplier) = 2.4€`, () => {
    expect(getDeliveryFee({ distance: 1, cartValue: CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE, itemCount: 1, date: RUSH_HOUR_DATE })).toBe(2.4);
  });
});

describe("Detects rush hour correctly, rush hour is on friday 3 - 7 PM UTC", () => {
  it(`should return false when the date is before rush hour`, () => {
    const FRIDAY_2_PM = new Date("2021-10-01T14:00");
    expect(isRushHour(FRIDAY_2_PM)).toBe(false);
  });

  it(`should return true when the date is during rush hour`, () => {
    const FRIDAY_3_PM = new Date("2021-10-01T15:00");
    expect(isRushHour(FRIDAY_3_PM)).toBe(true);
  });

  it(`should return false when the date is after rush hour`, () => {
    const FRIDAY_7_PM = new Date("2021-10-01T19:00");
    expect(isRushHour(FRIDAY_7_PM)).toBe(false);
  });

  it(`should return false when the date is on a different day`, () => {
    const SATURDAY_3_PM = new Date("2021-10-02T15:00");
    expect(isRushHour(SATURDAY_3_PM)).toBe(false);
  });

  it(`Throws on invalid dates`, () => {
    // @ts-expect-error expecting error on invalid input
    expect(() => isRushHour("invalid date")).toThrow();
  });
});
