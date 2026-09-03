import { useQuery } from "@tanstack/react-query"
import type { GetUsersQueryParams } from "../types/userType"
import { userService } from "../service/userService"

export const useGetAllUsers = (params:GetUsersQueryParams)=>{
    return useQuery({
        queryKey:["allUsers",params],
        queryFn:()=>userService.getAllUsers(params),
        select: (response) => response?.data,
        staleTime:5*60*1000,
    })
}