import { describe, it, expect } from "vitest";
import {
  getSmallOrderSurchargeWrapper,
  getFeeByDistanceWrapper,
  getBulkFeeWrapper,
  getDeliveryFeeWrapper,
  isRushHourWrapper,
} from "../../../services/feeCalculationService/result.wrapper";

import {
  CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE,
  INITIAL_DELIVERY_FEE,
  DISTANCE_AFTER_ADDITIONAL_FEE_STARTS,
  ADDITIONAL_DISTANCE_FEE,
  ADDITIONAL_DISTANCE_INTERVAL,
  BULK_ITEMS_TIER_1_THRESHOLD,
  BULK_ITEMS_TIER_1_FEE,
  BULK_ITEMS_TIER_2_THRESHOLD,
  MAX_DELIVERY_FEE,
  MIN_CART_VALUE_FOR_FREE_DELIVERY,
} from "../../../services/feeCalculationService/internal";

const NOT_RUSH_HOUR_DATE = new Date("2021-10-01T14:59");
const RUSH_HOUR_DATE = new Date("2021-10-01T15:01");

const surchargeFloats = [
  { value: CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE + 0.1, expected: 0 },
  { value: CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE - 0.1, expected: 0.1 },
  { value: CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE - 9.9, expected: 9.9 },
  { value: CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE - 0.01, expected: 0.01 },
  //gets rounded toFixed(2)
  { value: CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE - 0.009, expected: 0.01 },
];

const surChargeIntegers = [
  {
    value: CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE + 1,
    expected: 0,
  },
  { value: CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE, expected: 0 },
  { value: CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE - 1, expected: 1 },
  { value: CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE - 9, expected: 9 },
];

describe(`If the cart value is less than ${CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE}€, a small order surcharge is added to the delivery price.
         The surcharge is the difference between the cart value and ${CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE}€.`, () => {
  it("Works on floats", () => {
    surchargeFloats.forEach(({ value, expected }) => {
      expect(getSmallOrderSurchargeWrapper(value).data).toBe(expected);
    });
  });

  it("Works on integers", () => {
    surChargeIntegers.forEach(({ value, expected }) => {
      expect(getSmallOrderSurchargeWrapper(value).data).toBe(expected);
    });
  });
});

const distanceBelowBaseDistance = [
  { value: 1, expected: INITIAL_DELIVERY_FEE },
  { value: DISTANCE_AFTER_ADDITIONAL_FEE_STARTS - 1, expected: INITIAL_DELIVERY_FEE },
];

const worksWithTheIntervals = [
  { value: DISTANCE_AFTER_ADDITIONAL_FEE_STARTS + 1, expected: INITIAL_DELIVERY_FEE + ADDITIONAL_DISTANCE_FEE },
  { value: DISTANCE_AFTER_ADDITIONAL_FEE_STARTS + ADDITIONAL_DISTANCE_INTERVAL, expected: INITIAL_DELIVERY_FEE + ADDITIONAL_DISTANCE_FEE },
];

describe(`A delivery fee for the first 1000 meters (=1km) is 2€. 
If the delivery distance is longer than that, 1€ is added for every additional 500 meters that 
the courier needs to travel before reaching the destination. 
Even if the distance would be shorter than 500 meters, the minimum fee is always 1€. `, () => {
  it("If the delivery distance is less than the base distance (1km), the delivery fee is 2€", () => {
    distanceBelowBaseDistance.forEach(({ value, expected }) => {
      expect(getFeeByDistanceWrapper(value).data).toBe(expected);
    });
  });

  it("works with the intervals", () => {
    worksWithTheIntervals.forEach(({ value, expected }) => {
      expect(getFeeByDistanceWrapper(value).data).toBe(expected);
    });
  });
});

const bulkItemsBelowOrAtTier1Threshold = [
  { value: BULK_ITEMS_TIER_1_THRESHOLD, expected: 0 },
  { value: BULK_ITEMS_TIER_1_THRESHOLD - 1, expected: 0 },
];

const bulkItemsAboveTier1ThresholdButBelowTier2 = [
  {
    desc: `number of items is 1 over (${BULK_ITEMS_TIER_1_THRESHOLD}), fee should be 1 x ${BULK_ITEMS_TIER_1_FEE}`,
    value: BULK_ITEMS_TIER_1_THRESHOLD + 1,
    expected: BULK_ITEMS_TIER_1_FEE,
  },
  {
    desc: `Number of items is 1 under (${BULK_ITEMS_TIER_2_THRESHOLD}), fee should be ${
      BULK_ITEMS_TIER_2_THRESHOLD - BULK_ITEMS_TIER_1_THRESHOLD
    } x ${BULK_ITEMS_TIER_1_FEE}`,
    value: BULK_ITEMS_TIER_2_THRESHOLD - 1,
    expected: BULK_ITEMS_TIER_1_FEE * (BULK_ITEMS_TIER_2_THRESHOLD - BULK_ITEMS_TIER_1_THRESHOLD - 1),
  },
  {
    desc: "test",
    value: BULK_ITEMS_TIER_2_THRESHOLD,
    expected: BULK_ITEMS_TIER_1_FEE * (BULK_ITEMS_TIER_2_THRESHOLD - BULK_ITEMS_TIER_1_THRESHOLD),
  },
];

describe(`If the number of items is five or more, an additional 50 cent surcharge is added for each item above
 and including the fifth item. An extra "bulk" fee applies for more than 12 items of 1,20€.`, () => {
  bulkItemsBelowOrAtTier1Threshold.forEach(({ value, expected }) => {
    expect(getBulkFeeWrapper(value).data).toBe(expected);
  });

  bulkItemsAboveTier1ThresholdButBelowTier2.forEach(({ desc, value, expected }) => {
    it(desc, () => {
      expect(getBulkFeeWrapper(value).data).toBe(expected);
    });
  });
});

const totalFeeCalculations = [
  {
    desc: `Max fee cant exceed ${MAX_DELIVERY_FEE}€`,
    distance: 100000,
    cartValue: 1,
    itemCount: 1,
    date: NOT_RUSH_HOUR_DATE,
    expected: MAX_DELIVERY_FEE,
  },
  {
    desc: `The delivery is free when the cart value is equal or more than ${MIN_CART_VALUE_FOR_FREE_DELIVERY}€.`,
    distance: 1,
    cartValue: MIN_CART_VALUE_FOR_FREE_DELIVERY,
    itemCount: 1,
    date: NOT_RUSH_HOUR_DATE,
    expected: 0,
  },
  {
    desc: `The delivery is free when the cart value is equal or more than ${MIN_CART_VALUE_FOR_FREE_DELIVERY + 0.01}€.`,
    distance: 1,
    cartValue: MIN_CART_VALUE_FOR_FREE_DELIVERY + 0.01,
    itemCount: 1,
    date: NOT_RUSH_HOUR_DATE,
    expected: 0,
  },
];

describe("Total fee calculations", () => {
  totalFeeCalculations.forEach(({ desc, distance, cartValue, itemCount, date, expected }) => {
    it(desc, () => {
      expect(getDeliveryFeeWrapper({ distance, cartValue, itemCount, date }).data).toBe(expected);
    });
  });
});

describe(`During the Friday rush, 3 - 7 PM, the delivery fee (the total fee including possible surcharges) will be multiplied by 1.2x.
 However, the fee still cannot be more than the max (15€).`, () => {
  it("Fee cant still be over 15€", () => {
    expect(
      getDeliveryFeeWrapper({ distance: 10000, cartValue: CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE, itemCount: 100, date: RUSH_HOUR_DATE })
        .data
    ).toBe(15);
  });

  it(`Cart value of 10€ (no small order surcharge) and a distance of 1 (2€ base fee applied)
         should result in 2€ basefee * 1.2 (rush hour multiplier) = 2.4€`, () => {
    expect(
      getDeliveryFeeWrapper({ distance: 1, cartValue: CART_VALUE_THRESHOLD_FOR_NO_SURCHARGE, itemCount: 1, date: RUSH_HOUR_DATE }).data
    ).toBe(2.4);
  });
});

describe("Detects rush hour correctly, rush hour is on friday 3 - 7 PM UTC", () => {
  it(`should return false when the date is before rush hour`, () => {
    const FRIDAY_2_PM = new Date("2021-10-01T14:00");
    expect(isRushHourWrapper(FRIDAY_2_PM).data).toBe(false);
  });

  it(`should return true when the date is during rush hour`, () => {
    const FRIDAY_3_PM = new Date("2021-10-01T15:00");
    expect(isRushHourWrapper(FRIDAY_3_PM).data).toBe(true);
  });

  it(`should return false when the date is after rush hour`, () => {
    const FRIDAY_7_PM = new Date("2021-10-01T19:00");
    expect(isRushHourWrapper(FRIDAY_7_PM).data).toBe(false);
  });

  it(`should return false when the date is on a different day`, () => {
    const SATURDAY_3_PM = new Date("2021-10-02T15:00");
    expect(isRushHourWrapper(SATURDAY_3_PM).data).toBe(false);
  });
});
