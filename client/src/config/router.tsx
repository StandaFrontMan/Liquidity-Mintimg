import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useConnection } from "wagmi";
import { ROUTES } from "./routes";
import { OwnerRoute } from "@/pages/owner/config";
import { lazy } from "react";

const Stake = lazy(() => import("@/pages/stake/index"));
const Analytics = lazy(() => import("@/pages/analytics/index"));
const Charts = lazy(() => import("@/pages/charts/index"));
const Calculator = lazy(() => import("@/pages/calculator/index"));
const Owner = lazy(() => import("@/pages/owner/index"));

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

      <Route path={ROUTES.ANALYTICS} element={<Analytics />} />

      <Route element={<ProtectedRoute />}>
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
