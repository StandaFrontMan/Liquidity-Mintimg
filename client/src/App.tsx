import "./App.css";
import { Header } from "./features/header";
import { AppRouter } from "./config/router";

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono">
      <Header />

      <main className="px-4 py-10">
        <div className="w-full max-w-5xl mx-auto">
          <AppRouter />
        </div>
      </main>
    </div>
  );
}

export default App;
