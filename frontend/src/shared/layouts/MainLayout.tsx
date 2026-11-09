import { Outlet } from "react-router-dom";
import { Navbar } from "../components/navbar/Navbar";

export const MainLayout = () => {
  return (
    <div className="grid min-h-dvh grid-cols-[112px_minmax(0,1fr)] bg-canvas lg:grid-cols-[240px_minmax(0,1fr)]">
      <Navbar />
      <Outlet />
    </div>
  );
};
