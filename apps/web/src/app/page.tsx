import { ACTIVE_MILESTONE, getRuntimeEnvironment } from "@/lib/runtime-config";

export default function HomePage() {
  const env = getRuntimeEnvironment();

  return (
    <main className="shell" aria-labelledby="page-title">
      <section className="panel">
        <p className="eyebrow">{ACTIVE_MILESTONE}</p>
        <h1 id="page-title">Finish My Dinner</h1>
        <p>
          Repository bootstrap shell. Current runtime is stubbed, read-only, and
          cannot mutate carts or place orders.
        </p>
        <dl>
          <div>
            <dt>App environment</dt>
            <dd>{env.APP_ENV}</dd>
          </div>
          <div>
            <dt>MCP environment</dt>
            <dd>{env.MCP_ENV}</dd>
          </div>
          <div>
            <dt>Capability</dt>
            <dd>{env.CAPABILITY_LEVEL}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
