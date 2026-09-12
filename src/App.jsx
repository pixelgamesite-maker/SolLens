import registry from "./data/registry.json";
import { TokenCard } from "./components/TokenCard";

export default function App() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontFamily: "system-ui, sans-serif" }}>
        Tokenized Stock Registry
      </h1>
      <p style={{ fontFamily: "system-ui, sans-serif", color: "#666" }}>
        Rights, issuer, and redemption terms next to live price and basis.
      </p>
      {registry.tokens.map((token) => (
        <TokenCard key={token.id} token={token} />
      ))}
    </main>
  );
}
