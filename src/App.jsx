import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import { VantaProvider } from "./state/VantaContext";
import Home from "./routes/Home";
import Generator from "./routes/Generator";
import Collections from "./routes/Collections";
import Presets from "./routes/Presets";
import Builder from "./routes/Builder";
import Saved from "./routes/Saved";
import Settings from "./routes/Settings";
import Donate from "./routes/Donate";
import Privacy from "./routes/Privacy";
import Terms from "./routes/Terms";
import NotFound from "./routes/NotFound";

export default function App() {
  return (
    <VantaProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="generator" element={<Generator />} />
          <Route path="collections" element={<Collections />} />
          <Route path="presets" element={<Presets />} />
          <Route path="builder" element={<Builder />} />
          <Route path="saved" element={<Saved />} />
          <Route path="settings" element={<Settings />} />
          <Route path="donate" element={<Donate />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </VantaProvider>
  );
}
