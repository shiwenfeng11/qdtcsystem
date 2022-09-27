<script setup lang="ts">
    import { Search, Plus, Share, Download, Picture, Edit, Delete} from "@element-plus/icons-vue";
    import { onMounted,ref, reactive, nextTick} from 'vue';
    import {useClassStore, useStaffStore} from '@/store';
    import {StuAPI} from '@/api';
    import {httpBatch} from '@/utils/http';
    import {ElMessage, ElMessageBox, FormInstance, FormRules} from 'element-plus';
import { da } from "element-plus/es/locale";

    

    const ruleFormRef = ref<FormInstance>();
    const staffStore = useStaffStore();
    const classStore = useClassStore();
    const qlfcList = ref<Vm.StaffCategory[]>([]);
    const pgntList = ref<Vm.Student[]>([]);
    const checkedList = ref<[]>([]); 
    const editModel = reactive<{type: 1 | 2, isEdit: boolean, model: HttpPayload.EditStudent}>({
        type: 1,
        isEdit: false,
        model:{
            stu_id: 0,
            stu_name: '', 
            stu_avatar: "", 
            stu_cls_id: null, 
            stu_sex: 1, 
            stu_phone: '', 
            stu_phone2: '', 
            stu_born: '', 
            stu_qualification: 0, 
            stu_school: '', 
            stu_major: '', 
            stu_address: "", 
            stu_remark: ''
        } 
    });
    const assignModel = reactive<{isEdit: boolean, model: HttpPayload.assignCls}>({
        isEdit: false,
        model: {
            stu_id: null,
            stu_ids: [],
            stu_cls_id: 0
        }
    });
    const pagination = reactive({
        total: 0,
        currentpage: 1
    });
    const pgntModel = reactive<HttpPayload.Student>({
        stu_name: '', 
        stu_cls_id: 0, 
        stu_qualification: 0, 
        begin: 0, 
        pageSize: 5
    });
    const getData = async (fromPage1 = true) => {
        if(fromPage1) pagination.currentpage = 1;
        pgntModel.begin = (pagination.currentpage - 1) * pgntModel.pageSize;
        await httpBatch([() => classStore.init(),() => staffStore.init(), 
        () => {
            return new Promise((resolve, reject) => {
                StuAPI.get(pgntModel)
                    .then(r => {
                        pgntList.value = r.list;
                        pagination.total = r.total;
                        resolve(null);
                    })
                    .catch(() => {})
            })
        }])
        
    };
    const beginAdd = async () => {
        editModel.type = 1;
        ruleFormRef.value?.resetFields();
        editModel.model.stu_name = '';
        editModel.model.stu_avatar = ""; 
        editModel.model.stu_cls_id = null; 
        editModel.model.stu_sex  = 1;
        editModel.model.stu_phone ='';
        editModel.model.stu_phone2 = ''; 
        editModel.model.stu_born = '';
        editModel.model.stu_qualification = 0; 
        editModel.model.stu_school = ''; 
        editModel.model.stu_major = '';
        editModel.model.stu_address = "";
        editModel.model.stu_remark ='';
        nextTick(() => editModel.isEdit = true);
    };
    const beginUpdate = (index: Vm.Student) => {
        editModel.type = 2;
        ruleFormRef.value?.resetFields();
        editModel.model.stu_id = index.stu_id;
        editModel.model.stu_name = index.stu_name;
        editModel.model.stu_avatar = index.stu_avatar; 
        editModel.model.stu_cls_id = index.stu_cls_id; 
        editModel.model.stu_sex  = index.stu_sex;
        editModel.model.stu_phone = index.stu_phone;
        editModel.model.stu_phone2 = index.stu_phone2; 
        editModel.model.stu_born = index.stu_born;
        editModel.model.stu_qualification = index.stu_qualification; 
        editModel.model.stu_school = index.stu_school; 
        editModel.model.stu_major = index.stu_major;
        editModel.model.stu_address = index.stu_address;
        editModel.model.stu_remark = index.stu_remark;
        nextTick(() => editModel.isEdit = true);
    };
    const save = async () => {
        if(editModel.type === 1) {
            ruleFormRef.value?.validate();
            await httpBatch([() => StuAPI.add(editModel.model), () => getData()], true);
            nextTick(() => editModel.isEdit = false);
            ElMessage({message: `学生: ${editModel.model.stu_name} 新增成功`, type: 'success', customClass: "messageIndex" });
        } else {
            await httpBatch([() => StuAPI.update(editModel.model), () => getData()], true);
            nextTick(() => editModel.isEdit = false);
            ElMessage({message: `学生: ${editModel.model.stu_name} 新增成功`, type: 'success', customClass: "messageIndex" });
        }
    };
    const handle = (val: []) => {
        checkedList.value = val;
    };
    const divideSingle = (data: Vm.Student) => {
        assignModel.model.stu_id = data.stu_id;
        assignModel.model.stu_cls_id = data.stu_cls_id;
        nextTick(() => assignModel.isEdit = true);
    };
    const divideTotal = () => {
        checkedList.value.forEach(item => {
            assignModel.model.stu_ids.push(item.stu_id)
        })
        assignModel.model.stu_cls_id = 0;
        assignModel.model.stu_id = null;
        nextTick(() => assignModel.isEdit = true)
    };
    const assignCls = async () => {
            await httpBatch([() => StuAPI.assignCls(assignModel.model), () => getData()]);
            nextTick(() => assignModel.isEdit = false);
            await ElMessage({message: '分配班级成功', type: "success", customClass: "messageIndex"})
    };
    onMounted( async () => {
        try {
           await getData();
            staffStore.categoryList.forEach(item => {
            if(item.dic_group_key === 'qualification')
            qlfcList.value.push(item);
        });
        } catch(e: any) {console.log(e.message)}
        
    });
    const rules = reactive<FormRules>({
        stu_name: [{required: true, message: '学生姓名不能为空',trigger: 'blur'}],
        stu_phone: [
            {required: true, message: '学生手机号不为空', trigger: 'blur'},
            {min: 11, max: 11, message: '电话号码长度为 11', trigger: 'blur'}
    ]
    });
    
</script>

<template>
    <el-container style="flex-grow: 1">
        <el-header height="36px">
            <el-form inline>
                <el-form-item label="学生姓名">
                    <el-input :prefix-icon="Search" placeholder="请输入内容" v-model="pgntModel.stu_name" @change="getData()"></el-input>
                </el-form-item>
                <el-form-item label="所在班级">
                    <el-select v-model="pgntModel.stu_cls_id" @change="getData()">
                        <el-option :value="0" label="- 请选择 -"></el-option>
                        <el-option :value="null" label="无班级"></el-option>
                        <el-option v-for="item in classStore.classList" :value="item.cls_id" :label="item.cls_name">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="学生学历" > 
                    <el-select v-model="pgntModel.stu_qualification" @change="getData()">
                        <el-option :value="0" label="- 请选择 -"></el-option>
                        <el-option 
                        v-for="item in qlfcList"
                        :value="item.dic_id" 
                        :label="item.dic_name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button :icon="Plus" type="primary" @click="beginAdd">新增</el-button>
                    <el-button :icon="Share" type="success" @click="divideTotal">批量分班</el-button>
                    <el-button :icon="Download" type="warning">导出学生信息</el-button>
                </el-form-item>
            </el-form>
        </el-header>
        <el-main>
            <el-table border :data="pgntList" center @selection-change="handle"> 
                <el-table-column type="index" label="#" fixed  align="center"></el-table-column>
                <el-table-column type="selection" fixed align="center" ></el-table-column>
                <el-table-column label="学生姓名" fixed prop="stu_name" min-width="100px" align="center"></el-table-column>
                <el-table-column label="班级" prop="stu_cls_id" min-width="120px" align="center">
                    <template #default="{row}">
                    <span>{{classStore.classList.find(item => item.cls_id === row.stu_cls_id)?.cls_name}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="存档照片" prop="stu_avatar" min-width="220px" align="center"></el-table-column>
                <el-table-column label="性别" prop="stu_sex" min-width="120px" align="center">
                    <template #default="{row}">
                        <span v-text="row.stu_sex === 1 ? '男' : '女'"></span>
                    </template>
                </el-table-column>
                <el-table-column label="联系电话" prop="stu_phone" min-width="120px" align="center"></el-table-column>
                <el-table-column label="联系电话2" prop="stu_phone2" min-width="120px" align="center"></el-table-column>
                <el-table-column label="出生日期" min-width="120px" align="center">
                    <template #default="{row}">
                        <el-icon><Present /></el-icon>
                        <span v-text="row.stu_born"></span>
                    </template>
                </el-table-column>
                <el-table-column label="学历" prop="stu_qualification" min-width="120px" align="center">
                    <template #default="{row}">
                         <span v-if="row.stu_qualification === 1">本科及以上</span>
                        <span v-else-if="row.stu_qualification === 2">专科</span>
                        <span v-else="row.stu_qualification === 3">高中及以下</span>
                    </template>
                    
                </el-table-column>
                <el-table-column label="毕业院校" prop="stu_school" min-width="120px" align="center"></el-table-column>
                <el-table-column label="院校专业" prop="stu_major" min-width="120px" align="center"></el-table-column>
                <el-table-column label="家庭住址" prop="stu_address" min-width="120px" align="center"></el-table-column>
                <el-table-column label="备注" prop="stu_remark" min-width="120px" align="center">
                    <template #default="{row}">
                        <span v-text="row.stu_remark === '' ? '暂无相关备注' : row.stu_remark"></span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" fixed="right" width="430px" align="center">
                    <template #default="{row}">
                        <el-button type="success" :icon="Share" @click="divideSingle(row)">分班</el-button>
                        <el-button type="warning" :icon="Picture">照片存档</el-button>
                        <el-button type="primary" :icon="Edit" @click="beginUpdate(row)">编辑</el-button>
                        <el-button type="danger" :icon="Delete">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
        <el-footer height="36px">
            <el-pagination
                :total="pagination.total"
                v-model:current-page="pagination.currentpage"
                v-model:page-size="pgntModel.pageSize"
                background
                :page-sizes="[5, 8, 10, 15]"
                layout="prev, pager, next, jumper,->,sizes,total"
                @size-change="getData()"
                @current-change="getData(false)"
            />
            
        </el-footer>
    </el-container>
    <!-- 新增/编辑 -->
    <el-dialog width="550px" v-model="editModel.isEdit" :title="editModel.type === 1 ? '功能编辑 —— 新增' : '功能编辑 —— 修改'">
        <el-form
        status-icon
        :rules="rules" 
        ref="RuleFormRef"
        :model="editModel.model"
        label-width="110px"
        label-position="right">
            <el-form-item label="学生姓名" prop="stu_name">
                <el-input placeholder="请输入学生姓名" v-model="editModel.model.stu_name" />
            </el-form-item>
            <el-form-item label="性别">
                <el-radio-group v-model="editModel.model.stu_sex">
                        <el-radio :label="1" size="large">男</el-radio>
                        <el-radio :label="0" size="large">女</el-radio>                  
                </el-radio-group>
            </el-form-item>
            <el-form-item label="联系电话" prop="stu_phone">
                <el-input 
                maxlength="11"
                show-word-limit
                v-model="editModel.model.stu_phone" placeholder="请输入手机号"></el-input>
            </el-form-item>
            <el-form-item label="备用电话">
                <el-input placeholder="请输入联系电话" v-model="editModel.model.stu_phone2">
                    <template #append> 例如: 028-88888888</template>
                </el-input>    
            </el-form-item>
            <el-form-item label="出生日期">
                <el-col :span="11">
                <el-date-picker
                    v-model="editModel.model.stu_born"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    placeholder="选择出生日期"
                    style="width: 100%"
                    />
                 </el-col>
            </el-form-item>
            <el-form-item label="学历">
                <el-select v-model="editModel.model.stu_qualification" @change="getData()">
                    <el-option label="请选择" :value="0" />
                    <el-option v-for='item in qlfcList' :label="item.dic_name" :value="item.dic_id" />
                </el-select>
            </el-form-item>
            <el-form-item label="在读/毕业院校">
                <el-input v-model="editModel.model.stu_school" placeholder="请输入在读/毕业院校（选填）"></el-input>
            </el-form-item>
            <el-form-item label="在校学习专业">
                <el-input v-model="editModel.model.stu_major" placeholder="请输入在校学习专业（选填）"></el-input>
            </el-form-item>
            <el-form-item label="家庭住址">
                <el-input v-model="editModel.model.stu_address" placeholder="请输入家庭住址"></el-input>
            </el-form-item>
            <el-form-item label="学生备注">
                <el-input placeholder="请输入备注" v-model="editModel.model.stu_remark"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="editModel.isEdit = false">取消</el-button>
                <el-button type="primary" @click="save">确定</el-button>
            </span>
        </template>
    </el-dialog>
    <!-- 班级分配 -->
    <el-dialog :model-value="assignModel.isEdit" title="班级分配" width="30%">
       <el-form>
            <el-form-item label="班级">
                <el-select v-model="assignModel.model.stu_cls_id">
                    <el-option :value="0" label="- 无班级 -"></el-option>
                    <el-option v-for="item in classStore.classList" :value="item.cls_id" :label="item.cls_name"></el-option>
                </el-select>
            </el-form-item>
       </el-form>
       <template #footer>
            <span class="dialog-footer">
                <el-button @click="assignModel.isEdit = false">取消</el-button>
                <el-button type="primary" @click="assignCls">分配</el-button>
            </span>
       </template>
    </el-dialog>

</template>

<style scoped lang="stylus">
   
</style>

