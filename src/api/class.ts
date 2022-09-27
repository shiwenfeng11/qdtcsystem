import {http} from "@/utils/http";

export default {
    getAll: () => http<null, Vm.Class[]>({url: "/class/all"}),
    pagination: (data: HttpPayload.Class) => http<HttpPayload.Class, {total: number, list: Vm.Class[]}>({url: "/class/list",method: 'post', data}),
    add: (data: HttpPayload.Edit) => http<HttpPayload.Edit, null>({url: "/class/add", method: "post", data}),
    update: (data: HttpPayload.Edit) => http<HttpPayload.Edit, null>({url: "/class/update", method: "post", data}),
    begin: (data: HttpPayload.classBegin) => http<HttpPayload.classBegin, null>({url: "/class/begin",method: "post", data}),
    end: (data: HttpPayload.classBegin) => http<HttpPayload.classBegin, null>({url: "/class/end", method: "post", data})
}