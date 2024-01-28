import { describe, it, expect } from "vitest";
import { internals } from "../../../services/feeCalculationService";

const rushHourCases = [
  {
    condition: `Before 3 PM`,
    date: new Date("2021-10-01T14:59"),
    expected: false,
  },
  {
    condition: "Is exactly start of rush hour",
    date: new Date("2021-10-01T15:00"),
    expected: true,
  },
  {
    condition: "Is between 3 - 7 PM on friday",
    date: new Date("2021-10-01T15:01"),
    expected: true,
  },
  {
    condition: `Over 7PM`,
    date: new Date("2021-10-01T19:01"),
    expected: false,
  },
  {
    condition: `Not Friday`,
    date: new Date("2021-09-01T18:00"),
    expected: false,
  },
];

describe("Detects rush hour correctly, rush hour is on friday 3 - 7 PM UTC", () => {
  rushHourCases.forEach(({ condition, date, expected }) => {
    it(`returns ${expected} when ${condition}`, () => {
      expect(internals.isRushHour(date)).toBe(expected);
    });
  });
});
