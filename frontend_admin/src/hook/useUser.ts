import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CreateUserPayload, GetUsersQueryParams, UpdateUserPayload } from "../types/userType"
import { userService } from "../service/userService"
import toast from "react-hot-toast"

export const useGetAllUsers = (params:GetUsersQueryParams)=>{
    return useQuery({
        queryKey:["allUsers",params],
        queryFn:()=>userService.getAllUsers(params),
        select: (response) => response?.data,
        staleTime:5*60*1000,
    })
}

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => userService.deleteUser(id),
        onSuccess: () => {
            toast.success("Xóa khách hàng thành công")
            queryClient.invalidateQueries({ queryKey: ["allUsers"] })
        },
        onError:()=>{
            toast.error("Xóa khách hàng thất bại")
        }
    })
}
export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: CreateUserPayload) => userService.createUser(user),
        onSuccess: () => {
            toast.success("Thêm khách hàng thành công")
            queryClient.invalidateQueries({ queryKey: ["allUsers"] })
        },
        onError:()=>{
            toast.error("Thêm khách hàng thất bại")
        }
    })
}
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, user }: { id: string; user: UpdateUserPayload }) => userService.updateUser(id, user),
        onSuccess: () => {
            toast.success("Cập nhật khách hàng thành công")
            queryClient.invalidateQueries({ queryKey: ["allUsers"] })
        },
        onError:()=>{
            toast.error("Cập nhật khách hàng thất bại")
        }
    })
}