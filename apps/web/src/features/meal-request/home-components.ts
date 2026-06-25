import type { HomeComponent } from "@finish-my-dinner/contracts";

/**
 * Chip catalogue for the home-state screen. Each chip maps to exactly one
 * `HomeComponent` from the shared contract — the enum is never re-declared here.
 *
 * "Dal/curry" maps to MAIN_DAL; the domain treats dal/curry/protein as
 * interchangeable mains (see inferMissingComponent). "Other" maps to UNKNOWN
 * and reveals a free-text note (home.rawText).
 */
export interface HomeComponentChip {
  readonly id: HomeComponent;
  readonly label: string;
  /** Chips that signal the user is unsure or short on food → lower confidence. */
  readonly lowConfidence?: boolean;
  /** Selecting this chip reveals the free-text note field. */
  readonly revealsNote?: boolean;
}

export const HOME_COMPONENT_CHIPS: readonly HomeComponentChip[] = [
  { id: "BASE_RICE", label: "Rice" },
  { id: "BASE_ROTI", label: "Rotis" },
  { id: "MAIN_DAL", label: "Dal/curry" },
  { id: "SIDE_VEGETABLE", label: "Sabzi" },
  { id: "MAIN_PROTEIN", label: "Eggs" },
  { id: "BASE_BREAD", label: "Bread" },
  { id: "SIDE_CURD", label: "Curd/raita" },
  { id: "LEFTOVER_SMALL", label: "Leftovers, not enough", lowConfidence: true },
  { id: "UNKNOWN", label: "Other", lowConfidence: true, revealsNote: true },
];

export function chipLabel(id: HomeComponent): string {
  return HOME_COMPONENT_CHIPS.find((chip) => chip.id === id)?.label ?? id;
}
