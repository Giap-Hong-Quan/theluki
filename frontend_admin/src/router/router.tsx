import { createBrowserRouter } from "react-router-dom";
import SigninPage from "../pages/auth/LoginPage";
import LayoutAdmin from "../layout/LayoutAdmin";
import RequireAuth from "../libs/RequireAuth";
import DashboardPage from "../pages/admin/DashboardPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <SigninPage />,
  },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      {
        element: <LayoutAdmin />,
        children: [{ index: true, element: <DashboardPage /> }],
      },
    ],
  },
]);

export default router;