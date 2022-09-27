import {http} from "@/utils/http";

export default {
    getAll: () => http<null,Vm.Classroom[]>({url: "/classroom/all"}),
    add: (data: HttpPayload.clsrEdit) => http<HttpPayload.clsrEdit, null>({url: "/classroom/add",method: "post", data}),
    update: (data: HttpPayload.clsrEdit) => http<HttpPayload.clsrEdit, null>({url: "/classroom/update", method: "post", data}),
    remove: (clsr_id: number) => http<null, null>({ url: "/classroom/remove/" + clsr_id})
  
}