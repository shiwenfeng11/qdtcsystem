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
            ElMessage({message: `??????: ${editModel.model.stu_name} ????????????`, type: 'success', customClass: "messageIndex" });
        } else {
            await httpBatch([() => StuAPI.update(editModel.model), () => getData()], true);
            nextTick(() => editModel.isEdit = false);
            ElMessage({message: `??????: ${editModel.model.stu_name} ????????????`, type: 'success', customClass: "messageIndex" });
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
            await ElMessage({message: '??????????????????', type: "success", customClass: "messageIndex"})
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
        stu_name: [{required: true, message: '????????????????????????',trigger: 'blur'}],
        stu_phone: [
            {required: true, message: '????????????????????????', trigger: 'blur'},
            {min: 11, max: 11, message: '????????????????????? 11', trigger: 'blur'}
    ]
    });
    
</script>

<template>
    <el-container style="flex-grow: 1">
        <el-header height="36px">
            <el-form inline>
                <el-form-item label="????????????">
                    <el-input :prefix-icon="Search" placeholder="???????????????" v-model="pgntModel.stu_name" @change="getData()"></el-input>
                </el-form-item>
                <el-form-item label="????????????">
                    <el-select v-model="pgntModel.stu_cls_id" @change="getData()">
                        <el-option :value="0" label="- ????????? -"></el-option>
                        <el-option :value="null" label="?????????"></el-option>
                        <el-option v-for="item in classStore.classList" :value="item.cls_id" :label="item.cls_name">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="????????????" > 
                    <el-select v-model="pgntModel.stu_qualification" @change="getData()">
                        <el-option :value="0" label="- ????????? -"></el-option>
                        <el-option 
                        v-for="item in qlfcList"
                        :value="item.dic_id" 
                        :label="item.dic_name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button :icon="Plus" type="primary" @click="beginAdd">??????</el-button>
                    <el-button :icon="Share" type="success" @click="divideTotal">????????????</el-button>
                    <el-button :icon="Download" type="warning">??????????????????</el-button>
                </el-form-item>
            </el-form>
        </el-header>
        <el-main>
            <el-table border :data="pgntList" center @selection-change="handle"> 
                <el-table-column type="index" label="#" fixed  align="center"></el-table-column>
                <el-table-column type="selection" fixed align="center" ></el-table-column>
                <el-table-column label="????????????" fixed prop="stu_name" min-width="100px" align="center"></el-table-column>
                <el-table-column label="??????" prop="stu_cls_id" min-width="120px" align="center">
                    <template #default="{row}">
                    <span>{{classStore.classList.find(item => item.cls_id === row.stu_cls_id)?.cls_name}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="????????????" prop="stu_avatar" min-width="220px" align="center"></el-table-column>
                <el-table-column label="??????" prop="stu_sex" min-width="120px" align="center">
                    <template #default="{row}">
                        <span v-text="row.stu_sex === 1 ? '???' : '???'"></span>
                    </template>
                </el-table-column>
                <el-table-column label="????????????" prop="stu_phone" min-width="120px" align="center"></el-table-column>
                <el-table-column label="????????????2" prop="stu_phone2" min-width="120px" align="center"></el-table-column>
                <el-table-column label="????????????" min-width="120px" align="center">
                    <template #default="{row}">
                        <el-icon><Present /></el-icon>
                        <span v-text="row.stu_born"></span>
                    </template>
                </el-table-column>
                <el-table-column label="??????" prop="stu_qualification" min-width="120px" align="center">
                    <template #default="{row}">
                         <span v-if="row.stu_qualification === 1">???????????????</span>
                        <span v-else-if="row.stu_qualification === 2">??????</span>
                        <span v-else="row.stu_qualification === 3">???????????????</span>
                    </template>
                    
                </el-table-column>
                <el-table-column label="????????????" prop="stu_school" min-width="120px" align="center"></el-table-column>
                <el-table-column label="????????????" prop="stu_major" min-width="120px" align="center"></el-table-column>
                <el-table-column label="????????????" prop="stu_address" min-width="120px" align="center"></el-table-column>
                <el-table-column label="??????" prop="stu_remark" min-width="120px" align="center">
                    <template #default="{row}">
                        <span v-text="row.stu_remark === '' ? '??????????????????' : row.stu_remark"></span>
                    </template>
                </el-table-column>
                <el-table-column label="??????" fixed="right" width="430px" align="center">
                    <template #default="{row}">
                        <el-button type="success" :icon="Share" @click="divideSingle(row)">??????</el-button>
                        <el-button type="warning" :icon="Picture">????????????</el-button>
                        <el-button type="primary" :icon="Edit" @click="beginUpdate(row)">??????</el-button>
                        <el-button type="danger" :icon="Delete">??????</el-button>
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
    <!-- ??????/?????? -->
    <el-dialog width="550px" v-model="editModel.isEdit" :title="editModel.type === 1 ? '???????????? ?????? ??????' : '???????????? ?????? ??????'">
        <el-form
        status-icon
        :rules="rules" 
        ref="RuleFormRef"
        :model="editModel.model"
        label-width="110px"
        label-position="right">
            <el-form-item label="????????????" prop="stu_name">
                <el-input placeholder="?????????????????????" v-model="editModel.model.stu_name" />
            </el-form-item>
            <el-form-item label="??????">
                <el-radio-group v-model="editModel.model.stu_sex">
                        <el-radio :label="1" size="large">???</el-radio>
                        <el-radio :label="0" size="large">???</el-radio>                  
                </el-radio-group>
            </el-form-item>
            <el-form-item label="????????????" prop="stu_phone">
                <el-input 
                maxlength="11"
                show-word-limit
                v-model="editModel.model.stu_phone" placeholder="??????????????????"></el-input>
            </el-form-item>
            <el-form-item label="????????????">
                <el-input placeholder="?????????????????????" v-model="editModel.model.stu_phone2">
                    <template #append> ??????: 028-88888888</template>
                </el-input>    
            </el-form-item>
            <el-form-item label="????????????">
                <el-col :span="11">
                <el-date-picker
                    v-model="editModel.model.stu_born"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    placeholder="??????????????????"
                    style="width: 100%"
                    />
                 </el-col>
            </el-form-item>
            <el-form-item label="??????">
                <el-select v-model="editModel.model.stu_qualification" @change="getData()">
                    <el-option label="?????????" :value="0" />
                    <el-option v-for='item in qlfcList' :label="item.dic_name" :value="item.dic_id" />
                </el-select>
            </el-form-item>
            <el-form-item label="??????/????????????">
                <el-input v-model="editModel.model.stu_school" placeholder="???????????????/????????????????????????"></el-input>
            </el-form-item>
            <el-form-item label="??????????????????">
                <el-input v-model="editModel.model.stu_major" placeholder="???????????????????????????????????????"></el-input>
            </el-form-item>
            <el-form-item label="????????????">
                <el-input v-model="editModel.model.stu_address" placeholder="?????????????????????"></el-input>
            </el-form-item>
            <el-form-item label="????????????">
                <el-input placeholder="???????????????" v-model="editModel.model.stu_remark"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="editModel.isEdit = false">??????</el-button>
                <el-button type="primary" @click="save">??????</el-button>
            </span>
        </template>
    </el-dialog>
    <!-- ???????????? -->
    <el-dialog :model-value="assignModel.isEdit" title="????????????" width="30%">
       <el-form>
            <el-form-item label="??????">
                <el-select v-model="assignModel.model.stu_cls_id">
                    <el-option :value="0" label="- ????????? -"></el-option>
                    <el-option v-for="item in classStore.classList" :value="item.cls_id" :label="item.cls_name"></el-option>
                </el-select>
            </el-form-item>
       </el-form>
       <template #footer>
            <span class="dialog-footer">
                <el-button @click="assignModel.isEdit = false">??????</el-button>
                <el-button type="primary" @click="assignCls">??????</el-button>
            </span>
       </template>
    </el-dialog>

</template>

<style scoped lang="stylus">
   
</style>

