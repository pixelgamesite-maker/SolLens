import { Route, Switch } from "wouter";
import { Header } from "@/components/Header";
import { Home } from "@/pages/Home";
import { TokenDetail } from "@/pages/TokenDetail";

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/t/:id">
          {(params) => <TokenDetail id={params.id} />}
        </Route>
        <Route>
          <main className="mx-auto max-w-5xl px-5 py-24">
            <h1 className="text-[26px] font-semibold">Nothing at this address.</h1>
            <a
              href="/"
              className="mt-4 inline-block text-discount underline underline-offset-2"
            >
              Back to the registry
            </a>
          </main>
        </Route>
      </Switch>
    </div>
  );
}
