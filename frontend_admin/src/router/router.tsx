import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import LayoutAdmin from "../layout/LayoutAdmin";
import RequireAuth from "../libs/RequireAuth";
import DashboardPage from "../pages/admin/DashboardPage";
import ReportPage from "../pages/admin/ReportPage";
import OrderPage from "../pages/admin/OrderPage";
import PosPage from "../pages/admin/PosPage";
import ReturnsPage from "../pages/admin/ReturnsPage";
import CustomerPage from "../pages/admin/CustomerPage";
import CskhPage from "../pages/admin/CskhPage";
import ProductPage from "../pages/admin/ProductPage";
import CollectionPage from "../pages/admin/CollectionPage";
import CategoryPage from "../pages/admin/CategoryPage";
import InventoryPage from "../pages/admin/InventoryPage";
import ReviewPage from "../pages/admin/ReviewPage";
import CouponPage from "../pages/admin/CouponPage";
import BlogPage from "../pages/admin/BlogPage";
import BannerPage from "../pages/admin/BannerPage";
import NotFoundPage from "../pages/common/NotFoundPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <RequireAuth allowedRoles={["admin", "staff"]} />,
    children: [
      {
        element: <LayoutAdmin />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "reports", element: <ReportPage /> },
          { path: "orders", element: <OrderPage /> },
          { path: "pos", element: <PosPage /> },
          { path: "returns", element: <ReturnsPage /> },
          { path: "customers", element: <CustomerPage /> },
          { path: "cskh", element: <CskhPage /> },
          { path: "products", element: <ProductPage /> },
          { path: "collections", element: <CollectionPage /> },
          { path: "categories", element: <CategoryPage /> },
          { path: "inventory", element: <InventoryPage /> },
          { path: "reviews", element: <ReviewPage /> },
          { path: "coupons", element: <CouponPage /> },
          { path: "blogs", element: <BlogPage /> },
          { path: "banners", element: <BannerPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;