import { describe, it, expect } from "vitest";
import { internals, Distances, DistanceFees } from "../../../services/feeCalculationService";

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
      expect(internals.getFeeByDistance(distance)).toBe(expected);
    });
  });
});
