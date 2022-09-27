declare namespace Vm {
    type Class = {
        cls_id: number,
        cls_name: string,
        cls_dic_id_major: number,
        cls_clsr_id: number,
        cls_stf_id_teacher: number,
        cls_stf_id_admin: number,
        cls_stf_id_job: number,
        cls_begin: string,
        cls_end: string,
        cls_remark: string,
        cls_status:  0 | 1 | 2 | 3
    }
}
declare namespace HttpPayload {
    type Class = {
        cls_name: string, 
        cls_dic_id_major: number, 
        cls_status: 0 | 1 | 2 | 3, 
        begin: number, 
        pageSize: number
    }
    type Edit = {
        cls_id: number,
        cls_name: string, 
        cls_dic_id_major: number, 
        cls_clsr_id: number, 
        cls_stf_id_teacher: number, 
        cls_stf_id_admin: number, 
        cls_stf_id_job: number, 
        cls_begin: string, 
        cls_end: string, 
        cls_remark: string
    }
    type classBegin = {
        cls_clsr_id: number,
        cls_id: number
    }
}