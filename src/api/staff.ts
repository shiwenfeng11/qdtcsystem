import {http} from '@/utils/http';

export default {
    getAll: () => http<null,Vm.StaffCategory[]>({url: "/dictionary/all"}),
    getStaffInfor: (data: HttpPayload.Staff) => http<HttpPayload.Staff, {total: number, list: Vm.Staff[]}>({url: "/staff/list",method: "post", data}),
    add: (data: HttpPayload.StaffEdit) => http<HttpPayload.StaffEdit, null>({url: "/staff/add", method: "post", data}),
    update: (data: HttpPayload.StaffEdit) => http<HttpPayload.StaffEdit, null>({url: "/staff/update",method: "post", data}),
    dimission: (stf_id: number) => http<null, null>({url: "/staff/dimission/" + stf_id}),
    reinstate: (stf_id: number) => http<null,null>({url: "/staff/reinstate/" + stf_id})
}