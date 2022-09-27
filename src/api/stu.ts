import {http} from "@/utils/http";

export default {
    get: (data: HttpPayload.Student) => http<HttpPayload.Student, {total: number, list: Vm.Student[]}>({url: "/student/list", method: 'post', data}),
    add: (data: HttpPayload.EditStudent) => http<HttpPayload.EditStudent, null>({url: "/student/add", method: "post",data}),
    update: (data: HttpPayload.EditStudent) => http<HttpPayload.EditStudent, null>({url: "/student/update", method: "post",data}),
    validatePhone: (data: string) => http<string, 0 | 1>({url: "/student/valid_phone", method: "post", data}),
    assignCls: (data: HttpPayload.assignCls) => http<HttpPayload.assignCls, null>({url: "/student/assignclass",method: 'post',data}),

}