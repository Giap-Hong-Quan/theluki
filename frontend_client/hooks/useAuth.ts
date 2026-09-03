import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { LoginFormData } from "@/validators/auth.validator";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { SignupPayload, UserProfile } from "@/types/authType";
import { getCookie } from "@/services/axios-client";

// Lấy thông tin Profile người dùng hiện tại
export const useProfile = () => {
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await authService.getProfile();
      return res?.profile || null;
    },
    enabled: typeof window !== "undefined" && !!getCookie("accessToken"),
    staleTime: 1000 * 60 * 5, // Cache 5 phút trong RAM
    retry: false,
  });
};

// đăng nhập
export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginFormData) => authService.signin(data),
    onSuccess: (res) => {
      // Lưu token vào Cookie
      if (res?.data?.accessToken) {
        document.cookie = `accessToken=${res.data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
      }
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success(res?.message || "Đăng nhập thành công!");
      router.push("/");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Đăng nhập thất bại, vui lòng thử lại!");
    },
  });
};

// Đăng xuất
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
      queryClient.setQueryData(["userProfile"], null);
      queryClient.removeQueries({ queryKey: ["userProfile"] });
      toast.success("Đăng xuất thành công!");
      router.push("/login");
    },
    onError: () => {
      document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
      queryClient.setQueryData(["userProfile"], null);
      queryClient.removeQueries({ queryKey: ["userProfile"] });
      router.push("/login");
    },
  });
};

// đăng ký 
export const useRegister = () => {
    return useMutation({
        mutationFn: (data: SignupPayload) => authService.signup(data),
        onSuccess: (res: any) => {
            toast.success(res?.message || "Đăng ký thành công! Vui lòng kiểm tra email để nhận mã OTP.");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Đăng ký thất bại, vui lòng thử lại!");
        },
    });
};

// Xác thực OTP
export const useVerifyOtp = () => {
    const router = useRouter();
    return useMutation({
        mutationFn: ({ email, otp }: { email: string; otp: string }) => 
            authService.verifyOtp(email, otp),
        onSuccess: (res: any) => {
            toast.success(res?.message || "Xác thực OTP thành công! Vui lòng đăng nhập.");
            router.push("/login");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xác thực OTP thất bại, vui lòng thử lại!");
        },
    });
};

// Gửi lại mã OTP
export const useSendOtp = () => {
    return useMutation({
        mutationFn: (email: string) => authService.sendOtp(email),
        onSuccess: (res: any) => {
            toast.success(res?.message || "Mã OTP mới đã được gửi về email!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Gửi mã OTP thất bại, vui lòng thử lại!");
        },
    });
};

// Đăng nhập Google
export const useGoogleAuth = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (token: string) => authService.googleLogin(token),
        onSuccess: (res: any) => {
            if (res?.data?.accessToken) {
                document.cookie = `accessToken=${res.data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
            }
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
            toast.success(res?.message || "Đăng nhập Google thành công!");
            router.push("/");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Đăng nhập Google thất bại, vui lòng thử lại!");
        },
    });
};

// Đăng nhập Facebook
export const useFacebookAuth = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (token: string) => authService.facebookLogin(token),
        onSuccess: (res: any) => {
            if (res?.data?.accessToken) {
                document.cookie = `accessToken=${res.data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
            }
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
            toast.success(res?.message || "Đăng nhập Facebook thành công!");
            router.push("/");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Đăng nhập Facebook thất bại, vui lòng thử lại!");
        },
    });
};

// Quên mật khẩu - Gửi mã OTP
export const useForgotPassword = () => {
    return useMutation({
        mutationFn: (email: string) => authService.forgotPassword(email),
        onSuccess: (res: any) => {
            toast.success(res?.message || "Mã OTP khôi phục đã được gửi về email!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Gửi OTP khôi phục thất bại, vui lòng thử lại!");
        },
    });
};

// Đặt lại mật khẩu mới bằng OTP
export const useResetPassword = () => {
    const router = useRouter();
    return useMutation({
        mutationFn: (payload: { email: string; otp: string; newPassword: string }) =>
            authService.resetPassword(payload),
        onSuccess: (res: any) => {
            toast.success(res?.message || "Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
            router.push("/login");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Đặt lại mật khẩu thất bại, vui lòng kiểm tra lại OTP!");
        },
    });
};

