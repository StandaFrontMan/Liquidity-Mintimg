import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useConnection } from "wagmi";
import { ROUTES } from "./routes";
import { Stake } from "@/pages";

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
        <Route path={ROUTES.PORTFOLIO} element={<>asdasd</>} />
        <Route path={ROUTES.ANALYTICS} element={<>asdasd</>} />
        <Route path={ROUTES.LEADERBOARD} element={<>asdasd</>} />
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
