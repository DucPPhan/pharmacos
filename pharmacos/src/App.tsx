import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import Dashboard from "./page/admin/Admindashboard";

function App() {
  // Call the hook conditionally but at the top level
  const tempoRoutes = import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
        </Routes>
        {tempoRoutes}
      </>
    </Suspense>
  );
}

export default App;
