import { Outlet } from "react-router-dom";
import Background from "./Background";
import Nav from "./Nav";
import Footer from "./Footer";
import { useVanta } from "../state/VantaContext";

export default function Layout() {
  const { settings, reduceMotion } = useVanta();

  return (
    <div className="relative flex min-h-screen flex-col">
      <Background enabled={settings.backgroundEffects} reduceMotion={reduceMotion} />
      <Nav />
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
