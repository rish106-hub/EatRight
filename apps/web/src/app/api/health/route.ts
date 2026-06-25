import { NextResponse } from "next/server";
import {
  ACTIVE_MILESTONE,
  getRuntimeEnvironment,
  M0_READ_ONLY_TOOL_ALLOWLIST,
} from "@/lib/runtime-config";

export const dynamic = "force-dynamic";

export function GET() {
  const env = getRuntimeEnvironment();

  return NextResponse.json({
    ok: true,
    milestone: ACTIVE_MILESTONE,
    appEnv: env.APP_ENV,
    mcpEnv: env.MCP_ENV,
    capabilityLevel: env.CAPABILITY_LEVEL,
    allowlist: M0_READ_ONLY_TOOL_ALLOWLIST,
  });
}
