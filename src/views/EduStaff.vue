<script setup lang="ts">
    import {Search,Edit, User} from '@element-plus/icons-vue';
    import {useStaffStore} from '@/store';
    import {onMounted, ref,reactive, nextTick} from 'vue';
    import {StaffAPI} from "@/api";
    import {ElMessageBox, FormInstance,FormRules,ElMessage, valueEquals} from 'element-plus';
    import { httpBatch } from '@/utils/http';
import { tr } from 'element-plus/es/locale';


    const ruleFormRef = ref<FormInstance>();
    const staffStore = useStaffStore();
    const searchModel = reactive<HttpPayload.Staff>({
        stf_category: 0,
        stf_name: "", 
        begin: 0, 
        pageSize: 5
    });
    const teachList = ref<Vm.StaffCategory[]>([]);
    const pagination = reactive({
        total: 0,
        currentpage: 1
    });
    const staffList = ref<Vm.Staff[]>([]);
    const editModel = reactive<{isEdit: boolean, type: 0 | 1 | 2, model: HttpPayload.StaffEdit}>
    ({
        isEdit: false,
        type: 1,
        model: {
            stf_id: 0,
            stf_name: "", 
            stf_category: 0, 
            stf_remark: "",
        }
    });
    const rules = reactive<FormRules>({
        stf_name: [
            {required: true, message: '员工姓名不能为空', trigger: 'blur'},
            {min: 2, max: 10, message: '员工姓名长度 2 - 10', trigger: 'blur'}
        ]
    })
    const getData = async (fromPage1 = true) => {
        try {
            if(fromPage1) pagination.currentpage = 1;
            searchModel.begin = (pagination.currentpage - 1) * searchModel.pageSize;
            await httpBatch([
                () => {
                    return new Promise((resolve, reject) => {
                        StaffAPI.getStaffInfor(searchModel)
                            .then( r => {
                                    const {total, list} = r;
                                    pagination.total = total;
                                    staffList.value = list;
                                    resolve(null);
                            } )
                            .catch(() => reject())
                    })
                },
                () => {
                    return new Promise((resolve, reject) => {
                    staffStore.init()
                        .then(() => {
                            resolve(null);
                        })
                        .catch(() => reject())
                        })
                }
            ], true)           
        } catch(e: any) {console.log(e.message)}   
    };
    const indexMethod = (index: number) => {
        return (pagination.currentpage - 1) * searchModel.pageSize + index + 1;
    };
    const beginAdd = () => {
        editModel.type = 1;
        ruleFormRef.value?.resetFields();
        editModel.model.stf_id = 0;
        editModel.model.stf_name = "";
        editModel.model.stf_remark = "";
        editModel.model.stf_category = 0;
        nextTick(() => editModel.isEdit = true);
    };
    const beginUpdate = (row: Vm.Staff) => {
        editModel.type = 2;
        ruleFormRef.value?.resetFields();
        editModel.model.stf_id = row.stf_id;
        editModel.model.stf_name = row.stf_name;
        editModel.model.stf_category = row.stf_category;
        editModel.model.stf_remark = row.stf_remark;
        nextTick(() => editModel.isEdit = true);
    };
    const save = async () => {
        try {
            if(editModel.type === 1) {
            ruleFormRef.value?.validate();
            await httpBatch([() => StaffAPI.add(editModel.model),() => getData() ],true)
            nextTick(() => {editModel.isEdit = false});
            ElMessage({
                message: `员工: ${editModel.model.stf_name} 新增成功`,
                type: 'success',
                customClass: 'messageIndex'
            })
        } else {
            await httpBatch([() => StaffAPI.update(editModel.model), () => getData()])
            nextTick(() => {editModel.isEdit = false});
            ElMessage({
                message: '修改成功',
                type: 'success',
                customClass: 'messageIndex'
                })
            }
        } catch(e: any) {console.log(e.message)}        
    }; 
    const dimission = async (row: Vm.Staff) => {
        await ElMessageBox.confirm(
            '离职?',
            '提示',
            {type: "warning"}
        )
            .then(() => {
                StaffAPI.dimission(row.stf_id);
                row.stf_invalid = 0;
            })
            .catch(() => {})
    };
    const reinstate = async (row: Vm.Staff) => {
        await ElMessageBox.confirm(
            '入职?',
            '提示',
            {type: "warning"}
        )
            .then(() => {
                StaffAPI.reinstate(row.stf_id);
                row.stf_invalid = 1;
            })
            .catch(() => {})
    };
    onMounted(async () => {
        try {
            await getData();
            staffStore.categoryList.forEach(item => {
                if(item.dic_group_key === 'staff_category')
                teachList.value.push(item);
            })           
        } catch(e: any) {console.log(e.message)}
    });
</script>

<template>
    <el-container>
       <el-header height="36px">
            <el-form inline>
                <el-form-item label="员工姓名">
                    <el-input :prefix-icon="Search" v-model="searchModel.stf_name" @change="getData()"></el-input>
                </el-form-item>
                <el-form-item label="员工类型">
                    <el-select v-model="searchModel.stf_category" @change="getData()">
                        <el-option :value="0" label="- 全部 -"></el-option>
                        <el-option
                         v-for="item in teachList"
                        :key="item.dic_id"
                        :value="item.dic_id"
                        :label="item.dic_name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="beginAdd">+ 新增</el-button>
                </el-form-item>
            </el-form>
       </el-header>
       <el-main>
            <el-table :data="staffList" border stripe>
                <el-table-column type="index" align="center" label="#" :index="indexMethod"></el-table-column>
                <el-table-column prop="stf_name" label="姓名" width="150"></el-table-column>
                <el-table-column prop="stf_category" label="职务类型" width="200">
                    <template #default="{row}">
                        <span>{{staffStore.categoryList.find(item => item.dic_id === row.stf_category)?.dic_name}}</span>
                    </template>                   
                </el-table-column>
                <el-table-column prop="stf_remark" label="备注" width="600">
                    <template #default="{row}">
                        <span v-if="row.stf_remark !== ''">{{row.stf_remark}}</span>
                        <span v-else style="color: #ccc">暂无相关备注</span>
                    </template>
                </el-table-column>
                <el-table-column prop="stf_invalid" label="员工状态" width="150">
                    <template #default="{row}">
                        <span style="color: rgb(103, 194, 58)" v-if="row.stf_invalid === 1 ">在职</span>
                        <span v-else style="color: red">离职</span>
                    </template> 
                </el-table-column>    
                <el-table-column label="操作">
                    <template #default="{row}">
                        <el-button :icon="Edit" type="primary" @click="beginUpdate(row)">编辑</el-button>
                        <el-button v-if="row.stf_invalid === 1" :icon="User" type="danger" @click="dimission(row)">离职</el-button>
                        <el-button v-else :icon="User" type="success" @click="reinstate(row)">入职</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
       <el-footer height="36px">
            <el-pagination
            :total="pagination.total"
            v-model:current-page="pagination.currentpage"
            v-model:page-size="searchModel.pageSize"
            :page-sizes="[5, 8, 10, 15]"
            layout="prev,pager,next,jumper,->,sizes,total"
            @size-change="getData()"
            @current-change="getData(false)"
            >
            </el-pagination>
       </el-footer>
    </el-container>
    <el-dialog v-model="editModel.isEdit" :title="editModel.type === 1 ? '员工编辑——新增' : '员工编辑——修改'" width="500px">
    <el-form 
    :model="editModel.model" 
    ref="ruleFormRef"
    label-width="80px"
    :rules="rules"
    >
      <el-form-item label="员工姓名" prop="stf_name">
        <el-input v-model="editModel.model.stf_name"/>
      </el-form-item>
      <el-form-item label="员工类型" >
        <el-select v-model="editModel.model.stf_category">
            <el-option :value="0" label="0"></el-option>
            <el-option
                v-for="item in teachList"
                :key="item.dic_id"
                :value="item.dic_id"
                :label="item.dic_name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="员工备注">
            <el-input placeholder="请输入内容.." v-model="editModel.model.stf_remark" ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editModel.isEdit = false">取消</el-button>
        <el-button type="primary" @click="save">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="stylus" scoped>
</style>