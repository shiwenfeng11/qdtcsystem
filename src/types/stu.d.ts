declare namespace Vm {
    type Student = {
        stu_id: number,
        stu_name: string,
        stu_avatar: string,
        stu_cls_id: number,
        stu_sex: 1 | 0,
        stu_phone: string,
        stu_phone2: string,
        stu_born: string,
        stu_qualification: number,
        stu_address: string,
        stu_remark: string,
        stu_school: string,
        stu_major: string
    }
}
declare namespace HttpPayload {
    type Student = {
        stu_name: string, 
        stu_cls_id: number, 
        stu_qualification: number, 
        begin: number, 
        pageSize: number
    }
    type EditStudent = {
        stu_id: number,
        stu_name: string,
        stu_avatar: string,
        stu_cls_id: number | null,
        stu_sex: 1 | 0,
        stu_phone: string,
        stu_phone2: string,
        stu_born: string,
        stu_qualification: number,
        stu_address: string,
        stu_remark: string,
        stu_school: string,
        stu_major: string 
    }
    type assignCls = {
        stu_id: number | null,
        stu_ids: [],
        stu_cls_id: number | null
    }
}