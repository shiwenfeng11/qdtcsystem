import {http} from '@/utils/http';

export default {
    getAll: () => http<null,Vm.Func[]>({url: "/function/all"}),
    remove: (id: number) => http<null,null>({url: "/function/remove/" + id, method: "post"}),
    add: (data: HttpPayLoad.Func) => http<HttpPayLoad.Func,number>({url: "/function/add", method: "post", data}),
    update: (data: HttpPayLoad.Func) => http<HttpPayLoad.Func,null>({url: "/function/update", method: "post", data})
}