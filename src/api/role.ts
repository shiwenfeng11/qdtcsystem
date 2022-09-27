import {http} from '@/utils/http';

export default {
    getAll: () => http<null, Vm.Role[]>({url: "/role/all"}),
    getRoleFuncs: (role_id: number) => http<null, Vm.Func[]>({url: "/role_function/list/" + role_id}),
    saveRoleFuncs: (data: HttpPayLoad.RoleFunc) => 
    http<HttpPayLoad.RoleFunc, null>({url: "/role_function/config", method: "post", data}),
    add: (data: HttpPayLoad.Role) => http<HttpPayLoad.Role, number>({url: "/role/add", method: "post", data}),
    edit: (data: HttpPayLoad.Role) => http<HttpPayLoad.Role, null>({url: "/role/update",method: "post", data}),
    validateName: (user_name: string) => http<null, 0 | 1>({url: "/user/valid_name/" + user_name}),
    remove: (role_id: number) => http<null,null>({url: "/role/remove/" + role_id, method: "post"})
}