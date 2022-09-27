declare namespace Vm {
    type Func = {
        func_id: number,
        func_name: string,
        func_key: string,
        func_fid: number
    };
    type TreeDataItem =  Func & {children?: TreeDataItem[]};
    type TreeData = TreeDataItem[];
}
declare namespace HttpPayLoad {
    type Func = {
        func_id: number,
        func_name: string,
        func_key: string,
        func_fid: number
    };
}