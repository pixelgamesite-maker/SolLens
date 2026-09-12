import registryData from "@/data/registry.json";
import { TokenCard } from "@/components/TokenCard";
import type { Token } from "@/types";

const tokens = registryData.tokens as Token[];

export default function App() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">SolLens</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Rights, issuer, and redemption terms next to live price and basis.
      </p>
      <div className="mt-6 space-y-4">
        {tokens.map((token) => (
          <TokenCard key={token.id} token={token} />
        ))}
      </div>
    </main>
  );
}
