import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import { createFeeCalculationService } from "../../../services/feeCalculationService/feeCalculationService";

const config = {
  //from 10 of the spec to 20
  CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE: 20,
  //from 200 of the spec to 300
  MIN_CART_VALUE_FOR_FREE_DELIVERY: 300,
  //from 15 of the spec to 30
  MAX_DELIVERY_FEE: 15,
  //from 2 of the spec to 3
  INITIAL_DELIVERY_FEE: 3,
  //from 1 of the spec to 2
  ADDITIONAL_DISTANCE_FEE: 2,
  //from 1000 of the spec to 1100
  DISTANCE_AFTER_ADDITIONAL_FEE_STARTS: 1100,
  //from 500 of the spec to 600
  ADDITIONAL_DISTANCE_INTERVAL: 600,
  RUSH_HOUR_START_HOUR: 15,
  RUSH_HOUR_END_HOUR: 19,
  RUSH_HOUR_DAY: 5,
  //from 1.2 of the spec to 1.3
  RUSH_HOUR_FEE_MULTIPLIER: 1.3,
  BULK_ITEMS_TIER_1_THRESHOLD: 4,
  BULK_ITEMS_TIER_2_THRESHOLD: 12,
  BULK_ITEMS_TIER_1_FEE: 0.5,
  BULK_ITEMS_TIER_2_FEE: 1.2,
};

const { getSmallOrderSurcharge, getFeeByDistance, getBulkFee, getDeliveryFee, isRushHour } =
  createFeeCalculationService(config);

const NOT_RUSH_HOUR_DATE = new Date("2021-10-01T14:59");
const RUSH_HOUR_DATE = new Date("2021-10-01T15:01");

describe(`If the cart value is less than ${config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE}€, a small order surcharge is added to the delivery price.
     The surcharge is the difference between the cart value and ${config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE}€.`, () => {
  it("Works on floats", () => {
    expect(getSmallOrderSurcharge(config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE - 1.1)).toBe(1.1);
    expect(getSmallOrderSurcharge(config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE - 0.01)).toBe(0.01);
    expect(getSmallOrderSurcharge(config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE - 0.009)).toBe(0.01);
  });

  it("Works on integers", () =>
    expect(getSmallOrderSurcharge(config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE - 9)).toBe(9));

  it("Works on exactly at the threshold", () => {
    expect(getSmallOrderSurcharge(config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE)).toBe(0);
    expect(getSmallOrderSurcharge(+config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE.toFixed(3))).toBe(0);
  });

  it(`Doesnt apply surcharge if the cart value is over ${config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE}€`, () =>
    expect(getSmallOrderSurcharge(config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE + 0.01)).toBe(0));

  it("Invalid inputs result in ZodError", () => {
    expect(getSmallOrderSurcharge(0)).toBeInstanceOf(ZodError);
    expect(getSmallOrderSurcharge(-1)).toBeInstanceOf(ZodError);
    // @ts-expect-error expecting error on invalid input
    expect(getSmallOrderSurcharge("1")).toBeInstanceOf(ZodError);
  });
});

describe(`A delivery fee for the first 1000 meters (=1km) is 2€. 
If the delivery distance is longer than that, 1€ is added for every additional 500 meters that 
the courier needs to travel before reaching the destination. 
Even if the distance would be shorter than 500 meters, the minimum fee is always 1€. `, () => {
  it("If the delivery distance is less than the base distance (1km), the delivery fee is 2€", () => {
    expect(getFeeByDistance(1)).toBe(config.INITIAL_DELIVERY_FEE);
    expect(getFeeByDistance(config.DISTANCE_AFTER_ADDITIONAL_FEE_STARTS - 1)).toBe(config.INITIAL_DELIVERY_FEE);
  });

  it("If the delivery distance is 1499 meters, the delivery fee is 3€", () =>
    expect(getFeeByDistance(config.DISTANCE_AFTER_ADDITIONAL_FEE_STARTS + 1)).toBe(
      config.INITIAL_DELIVERY_FEE + config.ADDITIONAL_DISTANCE_FEE
    ));
  it("If the delivery distance is 1500 meters, the delivery fee is 3€", () =>
    expect(getFeeByDistance(config.DISTANCE_AFTER_ADDITIONAL_FEE_STARTS + config.ADDITIONAL_DISTANCE_INTERVAL)).toBe(
      config.INITIAL_DELIVERY_FEE + config.ADDITIONAL_DISTANCE_FEE
    ));

  const oneDistanceIntervalOverBasePlusOneMeter =
    config.DISTANCE_AFTER_ADDITIONAL_FEE_STARTS + config.ADDITIONAL_DISTANCE_INTERVAL + 1;

  const initialFeePlusTwoIntervals = config.INITIAL_DELIVERY_FEE + config.ADDITIONAL_DISTANCE_FEE * 2;

  it(`If the delivery distance is ${oneDistanceIntervalOverBasePlusOneMeter} meters, the delivery fee is ${initialFeePlusTwoIntervals}€`, () =>
    expect(getFeeByDistance(oneDistanceIntervalOverBasePlusOneMeter)).toBe(initialFeePlusTwoIntervals));

  it("Floats result in ZodError", () => expect(getFeeByDistance(1499.9999999)).toBeInstanceOf(ZodError));
  it("Otherwise invalid inputs result in ZodError", () => {
    expect(getFeeByDistance(0)).toBeInstanceOf(ZodError);
    expect(getFeeByDistance(-1)).toBeInstanceOf(ZodError);
    // @ts-expect-error expecting error on invalid input
    expect(getFeeByDistance("1")).toBeInstanceOf(ZodError);
  });
});

describe(`If the number of items is five or more, an additional 50 cent surcharge is added for each item above
 and including the fifth item. An extra "bulk" fee applies for more than 12 items of 1,20€.`, () => {
  it("If the number of items is less than 4, no extra surcharge", () => expect(getBulkFee(3)).toBe(0));
  it("If the number of items is 4, no extra surcharge", () => expect(getBulkFee(4)).toBe(0));
  it("If the number of items is 5, 50 cents surcharge is added", () => expect(getBulkFee(5)).toBe(0.5));
  it("If the number of items is 10, 3€ surcharge (6 x 50 cents) is added", () => expect(getBulkFee(10)).toBe(3));
  it("If the number of items is 13, 5.70€ surcharge is added ((9 * 50 cents) + 1.20€)", () =>
    expect(getBulkFee(13)).toBe(5.7));
  it("If the number of items is 14, 6.20€ surcharge is added ((10 * 50 cents) + 1.20€)", () =>
    expect(getBulkFee(14)).toBe(6.2));
  it("Floats result in ZodError", () => expect(getBulkFee(13.99999)).toBeInstanceOf(ZodError));
  it("Other types of invalid inputs result in ZodError", () => {
    expect(getBulkFee(0)).toBeInstanceOf(ZodError);
    expect(getBulkFee(-1)).toBeInstanceOf(ZodError);
    // @ts-expect-error expecting error on invalid input
    expect(getBulkFee("1")).toBeInstanceOf(ZodError);
    // @ts-expect-error expecting error on invalid input
    expect(getBulkFee("a")).toBeInstanceOf(ZodError);
  });
});

describe("Total fee calculations", () => {
  it(`The delivery fee can never be more than ${config.MAX_DELIVERY_FEE}€, including possible surcharges.`, () => {
    expect(getDeliveryFee({ distance: 100000, cartValue: 1, numberOfItems: 1, orderTime: NOT_RUSH_HOUR_DATE })).toBe(
      15
    );
  });

  it(`The delivery is free (0€) when the cart value is equal or more than ${config.MIN_CART_VALUE_FOR_FREE_DELIVERY}€.`, () => {
    expect(
      getDeliveryFee({
        distance: 1,
        cartValue: config.MIN_CART_VALUE_FOR_FREE_DELIVERY,
        numberOfItems: 1,
        orderTime: NOT_RUSH_HOUR_DATE,
      })
    ).toBe(0);
    expect(
      getDeliveryFee({
        distance: 1,
        cartValue: config.MIN_CART_VALUE_FOR_FREE_DELIVERY - 0.0001,
        numberOfItems: 1,
        orderTime: NOT_RUSH_HOUR_DATE,
      })
    ).toBe(config.INITIAL_DELIVERY_FEE);
  });

  it(`Returns ZodError on invalid inputs`, () => {
    expect(
      getDeliveryFee({ distance: 0, cartValue: 0, numberOfItems: 0, orderTime: NOT_RUSH_HOUR_DATE })
    ).toBeInstanceOf(ZodError);
    expect(
      getDeliveryFee({ distance: -1, cartValue: -1, numberOfItems: -1, orderTime: NOT_RUSH_HOUR_DATE })
    ).toBeInstanceOf(ZodError);

    expect(
      // @ts-expect-error expecting error on invalid input
      getDeliveryFee({ distance: "1", cartValue: "1", numberOfItems: "1", orderTime: new Date("invalid date") })
    ).toBeInstanceOf(ZodError);
    // @ts-expect-error expecting error on invalid input
    expect(getDeliveryFee({ distance: 1, cartValue: 1, numberOfItems: 1, orderTime: "invalid date" })).toBeInstanceOf(
      ZodError
    );
    expect(
      getDeliveryFee({ distance: 1, cartValue: 1, numberOfItems: 1, orderTime: new Date("invalid date") })
    ).toBeInstanceOf(ZodError);
    expect(
      getDeliveryFee({ distance: 1, cartValue: 1, numberOfItems: -1, orderTime: new Date("2021-10-01T14:59") })
    ).toBeInstanceOf(ZodError);
    expect(
      getDeliveryFee({ distance: 1, cartValue: -1, numberOfItems: 1, orderTime: new Date("2021-10-01T14:59") })
    ).toBeInstanceOf(ZodError);
    expect(
      getDeliveryFee({ distance: -1.001, cartValue: 1, numberOfItems: 1, orderTime: new Date("2021-10-01T14:59") })
    ).toBeInstanceOf(ZodError);
  });
});

describe(`During the Friday rush, 3 - 7 PM, the delivery fee (the total fee including possible surcharges) will be multiplied by 
${config.RUSH_HOUR_FEE_MULTIPLIER}x.
 However, the fee still cannot be more than the max (${config.MAX_DELIVERY_FEE}€).`, () => {
  it(`Fee cant still be over ${config.MAX_DELIVERY_FEE}€`, () => {
    expect(getDeliveryFee({ distance: 100000, cartValue: 10, numberOfItems: 1000, orderTime: RUSH_HOUR_DATE })).toBe(
      config.MAX_DELIVERY_FEE
    );
  });

  const baseFeeMultiplied = +(config.INITIAL_DELIVERY_FEE * config.RUSH_HOUR_FEE_MULTIPLIER).toFixed(2);

  it(`Cart value of ${config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE}€ (no small order surcharge) 
    and a distance of 1 (${config.INITIAL_DELIVERY_FEE}€ base fee applied)
     should result in ${config.INITIAL_DELIVERY_FEE}€ basefee * ${config.RUSH_HOUR_FEE_MULTIPLIER} 
     (rush hour multiplier) = ${baseFeeMultiplied}€`, () => {
    expect(
      getDeliveryFee({
        distance: 1,
        cartValue: config.CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE,
        numberOfItems: 1,
        orderTime: RUSH_HOUR_DATE,
      })
    ).toBe(baseFeeMultiplied);
  });
});

const FRIDAY_2_PM = new Date("2021-10-01T14:00");
const FRIDAY_3_PM = new Date("2021-10-01T15:00");
const FRIDAY_7_PM = new Date("2021-10-01T19:00");
const SATURDAY_3_PM = new Date("2021-10-02T15:00");

describe("Detects rush hour correctly, rush hour is on friday 3 - 7 PM UTC", () => {
  it(`should return false when the date is before rush hour`, () => expect(isRushHour(FRIDAY_2_PM)).toBe(false));
  it(`should return true when the date is during rush hour`, () => expect(isRushHour(FRIDAY_3_PM)).toBe(true));
  it(`should return false when the date is after rush hour`, () => expect(isRushHour(FRIDAY_7_PM)).toBe(false));
  it(`should return false when the date is on a different day`, () => expect(isRushHour(SATURDAY_3_PM)).toBe(false));
  it(`Returns ZodError on invalid dates`, () => expect(isRushHour(new Date("invalid date"))).toBeInstanceOf(ZodError));
});

describe("Validates the config correctly", () => {
  it("Works on valid config", () => expect(() => createFeeCalculationService(config)).not.toThrow());
  it("Throws on invalid rush hour setup", () => {
    expect(() =>
      createFeeCalculationService({ ...config, RUSH_HOUR_START_HOUR: 20, RUSH_HOUR_END_HOUR: 19 })
    ).toThrow();
    expect(() =>
      createFeeCalculationService({ ...config, RUSH_HOUR_START_HOUR: 20, RUSH_HOUR_END_HOUR: 24 })
    ).toThrow();

    expect(() => createFeeCalculationService({ ...config, RUSH_HOUR_DAY: 7 })).toThrow();
  });

  it("Throws on invalid bulk items setup", () => {
    expect(() =>
      createFeeCalculationService({ ...config, BULK_ITEMS_TIER_1_THRESHOLD: 12, BULK_ITEMS_TIER_2_THRESHOLD: 4 })
    ).toThrow();
  });

  it("Throws on values outside 'sensible' defaults (catching accidents)", () => {
    expect(() => createFeeCalculationService({ ...config, MAX_DELIVERY_FEE: 51 })).toThrow();
    expect(() => createFeeCalculationService({ ...config, BULK_ITEMS_TIER_1_FEE: 6 })).toThrow();
    expect(() => createFeeCalculationService({ ...config, BULK_ITEMS_TIER_2_FEE: 6 })).toThrow();
  });

  it("Throws on non-integer values for integer-only fields", () => {
    const invalidConfig = { ...config, CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE: 10.5 };
    expect(() => createFeeCalculationService(invalidConfig)).toThrow();
  });

  it("Throws on non-positive values where positive values are required", () => {
    const invalidConfig = { ...config, ADDITIONAL_DISTANCE_FEE: -1 };
    expect(() => createFeeCalculationService(invalidConfig)).toThrow();
  });

  it("Accepts edge case values for time boundaries", () => {
    expect(() => createFeeCalculationService({ ...config, RUSH_HOUR_START_HOUR: 0 })).not.toThrow();
    expect(() => createFeeCalculationService({ ...config, RUSH_HOUR_END_HOUR: 23 })).not.toThrow();
  });
});
