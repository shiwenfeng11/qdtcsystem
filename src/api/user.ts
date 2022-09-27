import {http} from "@/utils/http";

export default {
    login: (data:HttpPayload.Login) => http<HttpPayload.Login,string>({url: "/user/login", method: "post",data}),
    getMenu: () => http<null,Array<Vm.Func>>({url: "/user/getMenu",method: "post"}),
    get: (data: HttpPayLoad.UserSearch) => 
    http<HttpPayLoad.UserSearch,{total: number, list: Vm.User[]}>({url: "/user/list", method: "post", data}),
    remove: (user_name: string) => http<null, null>({url:"/user/remove/" + user_name, method: "post"}),
    resetPwd: (user_name: string) => http<null,null>({url: "/user/reset_pwd/" + user_name, method: "post"}),
    add: (user_name: string) => http<null, null>({url:"/user/add/" + user_name, method: "post"}),
    configRole: (data: HttpPayLoad.ConfigRole) => http<HttpPayLoad.ConfigRole, null>({url:"/user/config_role",method: "post",data}),
    validateName: (user_name: string) => http<null, 0 | 1>({url: "/user/valid_name/" + user_name})
}; 
//分页: 
//total 按当前条件查找总共几条数据, list的值为数据的数组