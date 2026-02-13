import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useConnection } from "wagmi";
import { ROUTES } from "./routes";
import { Analytics, Calculator, Charts, Owner, Stake } from "@/pages";
import { OwnerRoute } from "@/pages/owner/config";

function ProtectedRoute() {
  const { isConnected } = useConnection();

  if (!isConnected) {
    return <Navigate to={ROUTES.STAKE} replace />;
  }

  return <Outlet />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.STAKE} />} />
      <Route path={ROUTES.STAKE} element={<Stake />} />

      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.ANALYTICS} element={<Analytics />} />

        <Route path={ROUTES.CALCULATOR} element={<Calculator />} />

        <Route path={ROUTES.CHARTS} element={<Charts />} />

        <Route element={<OwnerRoute />}>
          <Route path={ROUTES.ADMIN} element={<Owner />} />
        </Route>
      </Route>

      {/* <Route
        path="/portfolio"
        element={
          <ProtectedRoute>
            <PortfolioPage />
          </ProtectedRoute>
        }
      /> */}
      {/* 404 */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}
