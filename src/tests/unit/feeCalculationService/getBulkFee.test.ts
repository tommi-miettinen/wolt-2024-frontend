import { describe, it, expect } from "vitest";
import { internals } from "../../../services/feeCalculationService";

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
      expect(internals.getBulkFee(itemCount)).toBe(expected);
    });
  });
});
