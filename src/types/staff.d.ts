declare namespace Vm {
    type Staff = {
        stf_id: number,
        stf_name: string,
        stf_category: number,
        stf_remark: string,
        stf_invalid: 1 | 0
    }
}

declare namespace HttpPayload {
    type Staff = {
        stf_category: number,
        stf_name: string,
        begin: number,
        pageSize: number
    }
    type StaffEdit = {
        stf_id?: number,
        stf_name: string,
        stf_category: number,
        stf_remark: string,
    }
}