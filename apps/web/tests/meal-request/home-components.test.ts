import { HOME_COMPONENT_VALUES } from "@finish-my-dinner/contracts";
import { describe, expect, it } from "vitest";
import {
  HOME_COMPONENT_CHIPS,
  chipLabel,
} from "../../src/features/meal-request/home-components";

const REQUIRED_LABELS = [
  "Rice",
  "Rotis",
  "Dal/curry",
  "Sabzi",
  "Eggs",
  "Bread",
  "Curd/raita",
  "Leftovers, not enough",
  "Other",
];

describe("home component chips", () => {
  it("offers every required home-state option", () => {
    const labels = HOME_COMPONENT_CHIPS.map((chip) => chip.label);
    for (const required of REQUIRED_LABELS) {
      expect(labels).toContain(required);
    }
  });

  it("maps every chip to a valid contract HomeComponent", () => {
    for (const chip of HOME_COMPONENT_CHIPS) {
      expect(HOME_COMPONENT_VALUES).toContain(chip.id);
    }
  });

  it("uses unique enum ids", () => {
    const ids = HOME_COMPONENT_CHIPS.map((chip) => chip.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("reveals a note only for Other", () => {
    const reveal = HOME_COMPONENT_CHIPS.filter((chip) => chip.revealsNote);
    expect(reveal).toHaveLength(1);
    expect(reveal[0]?.id).toBe("UNKNOWN");
  });

  it("resolves labels by id", () => {
    expect(chipLabel("BASE_RICE")).toBe("Rice");
  });
});
