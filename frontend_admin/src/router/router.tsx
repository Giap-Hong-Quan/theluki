import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import LayoutAdmin from "../layout/LayoutAdmin";
import RequireAuth from "../libs/RequireAuth";
import NotFoundPage from "../pages/common/NotFoundPage";

// Lazy load các trang Admin để kích hoạt cơ chế Loading Page (Suspense)
const DashboardPage = lazy(() => import("../pages/admin/DashboardPage"));
const ReportPage = lazy(() => import("../pages/admin/ReportPage"));
const OrderPage = lazy(() => import("../pages/admin/OrderPage"));
const PosPage = lazy(() => import("../pages/admin/PosPage"));
const ReturnsPage = lazy(() => import("../pages/admin/ReturnsPage"));
const CustomerPage = lazy(() => import("../pages/admin/CustomerPage"));
const CskhPage = lazy(() => import("../pages/admin/CskhPage"));
const ProductPage = lazy(() => import("../pages/admin/ProductPage"));
const CollectionPage = lazy(() => import("../pages/admin/CollectionPage"));
const CategoryPage = lazy(() => import("../pages/admin/CategoryPage"));
const InventoryPage = lazy(() => import("../pages/admin/InventoryPage"));
const ReviewPage = lazy(() => import("../pages/admin/ReviewPage"));
const CouponPage = lazy(() => import("../pages/admin/CouponPage"));
const BlogPage = lazy(() => import("../pages/admin/BlogPage"));
const BannerPage = lazy(() => import("../pages/admin/BannerPage"));

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