/**
 * Local sample addresses for M0 stub mode. These are NOT fetched from Swiggy
 * (get_addresses is a forbidden MCP call in this task). The user must still
 * choose one explicitly — no auto-pick (INV-004). `id` satisfies idSchema.
 */
export interface SampleAddress {
  readonly id: string;
  readonly label: string;
  readonly area: string;
}

export const SAMPLE_ADDRESSES: readonly SampleAddress[] = [
  { id: "address-sample-home", label: "Home", area: "Indiranagar" },
  { id: "address-sample-work", label: "Work", area: "Koramangala" },
  { id: "address-sample-other", label: "Other", area: "HSR Layout" },
];
