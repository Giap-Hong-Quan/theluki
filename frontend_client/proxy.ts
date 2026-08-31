import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { ROUTE_CONFIG } from "./contants/routes";

interface JwtPayload {
  id?: string;
  role?: string;
  exp?: number;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lấy Access Token từ Cookies
  const token = request.cookies.get("accessToken")?.value;

  // Giải mã Token lấy role và kiểm tra hợp lệ
  let isTokenValid = false;
  let userRole: string | null = null;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const isExpired = decoded.exp ? decoded.exp * 1000 < Date.now() : false;
      if (decoded && (decoded.id || decoded.role) && !isExpired) {
        isTokenValid = true;
        userRole = decoded.role || null;
      }
    } catch {
      isTokenValid = false;
    }
  }

  // 1. Kiểm tra trang Auth (/login, /register...) -> Đã login thì về trang chủ
  const isAuthRoute = ROUTE_CONFIG.AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isAuthRoute) {
    if (isTokenValid) {
      return NextResponse.redirect(
        new URL(ROUTE_CONFIG.DEFAULT_LOGIN_REDIRECT, request.url)
      );
    }
    return NextResponse.next();
  }

  // 2. Kiểm tra trang Admin (/admin/...) -> Yêu cầu login & role 'admin'
  const isAdminRoute = ROUTE_CONFIG.ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isAdminRoute) {
    if (!isTokenValid) {
      const loginUrl = new URL(ROUTE_CONFIG.LOGIN_PATH, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== "admin") {
      return NextResponse.redirect(
        new URL(ROUTE_CONFIG.DEFAULT_LOGIN_REDIRECT, request.url)
      );
    }
    return NextResponse.next();
  }

  // 3. Kiểm tra trang Private (/profile, /checkout...) -> Yêu cầu login
  const isPrivateRoute = ROUTE_CONFIG.PRIVATE_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isPrivateRoute) {
    if (!isTokenValid) {
      const loginUrl = new URL(ROUTE_CONFIG.LOGIN_PATH, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 4. Các trang còn lại là Public (Trang chủ, sản phẩm, tin tức...)
  return NextResponse.next();
}

// Áp dụng proxy cho toàn bộ trang (ngoại trừ API và file tĩnh)
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
