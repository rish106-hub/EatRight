import {
  addressServiceabilityContextSchema,
  type AddressServiceabilityContext,
  type CompletionRequest,
} from "@finish-my-dinner/contracts";
import type { StubScenarioId } from "@finish-my-dinner/providers-stub";

const checkedAt = "2026-06-25T12:00:00.000+05:30";

const DEMO_ADDRESS_IDS = [
  "address-sample-home",
  "address-sample-work",
  "address-sample-other",
] as const;

export type DemoAddressId = (typeof DEMO_ADDRESS_IDS)[number];

export function isDemoAddressId(addressId: string): addressId is DemoAddressId {
  return (DEMO_ADDRESS_IDS as readonly string[]).includes(addressId);
}

export function resolveDemoServiceability(
  addressId: DemoAddressId,
): AddressServiceabilityContext {
  return addressServiceabilityContextSchema.parse({
    addressId,
    selectedByUser: true,
    serviceability: {
      FOOD: "SERVICEABLE",
      INSTAMART: "SERVICEABLE",
    },
    checkedAt,
  });
}

export function selectStubScenario(
  request: CompletionRequest,
  addressId: DemoAddressId,
): StubScenarioId {
  if (addressId === "address-sample-other") {
    return "both_provider_failure";
  }

  if (addressId === "address-sample-work") {
    return request.home.components.includes("BASE_ROTI")
      ? "instamart_failure_food_success"
      : "food_failure_instamart_success";
  }

  if (request.home.components.includes("MAIN_DAL")) {
    return "dal_base";
  }

  if (request.home.components.includes("BASE_ROTI")) {
    return "rotis_main";
  }

  if (request.home.components.includes("LEFTOVER_SMALL")) {
    return "insufficient_biryani_volume";
  }

  return "both_provider";
}
