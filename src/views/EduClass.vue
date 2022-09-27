<script setup lang="ts">
    import {Plus, Edit, Failed, Checked} from '@element-plus/icons-vue';
    import {useStaffStore, useClsrStore} from '@/store';
    import {onMounted, ref, reactive, nextTick} from 'vue';
    import {ClsAPI, StaffAPI} from '@/api';
    import {httpBatch} from '@/utils/http';
    import {FormInstance, FormRules,ElMessage} from 'element-plus';


    const FormRef = ref<FormInstance>();
    const staffStore = useStaffStore();
    const clsrStore = useClsrStore();
    const classList = ref<Vm.StaffCategory[]>([]);
    const show = ref<Vm.Class[]>([]);
    const teacherList = ref<Vm.Staff[]>([]);
    const jiaowuList = ref<Vm.Staff[]>([]);
    const jiaoxueList = ref<Vm.Staff[]>([]);
    const jiuyeList = ref<Vm.Staff[]>([]);
    const model = {
        stf_category: 0,
        stf_name: "", 
        begin: 0, 
        pageSize: 5
    };
    const pagination = reactive({
        total: 0,
        currentPage: 1
    });
    const searchModel = reactive<HttpPayload.Class>({
        cls_name: '', 
        cls_dic_id_major: 0, 
        cls_status: 0, 
        begin: 0, 
        pageSize: 5
    });
    const editModel = reactive<{type: 1 | 2, isEdit: boolean, isBegin: boolean, model: HttpPayload.Edit}>({
        type: 1,
        isEdit: false,
        isBegin: false,
        model: {
            cls_id: 0,
            cls_name: '', 
            cls_dic_id_major: 0, 
            cls_clsr_id: 0, 
            cls_stf_id_teacher: 0, 
            cls_stf_id_admin: 0, 
            cls_stf_id_job: 0, 
            cls_begin: '', 
            cls_end: '', 
            cls_remark: ''
        }
    });
    const getData = async (fromPage1 = true) => {
        if(fromPage1) pagination.currentPage = 1;
        searchModel.begin = (pagination.currentPage - 1) * searchModel.pageSize;
        await httpBatch([
            () => {
                return new Promise((resolve, reject) => {
                     ClsAPI.pagination(searchModel)
                        .then(r => {
                            const {total, list} = r;
                            pagination.total = r.total;
                            show.value = r.list;
                            resolve(null);
                        })
                        .catch(() => {});
                })
            },
            () =>  staffStore.init(),
            () => {
                    return new Promise((resolve, reject) => {
                        StaffAPI.getStaffInfor(model)
                            .then( r => {
                                    const {total, list} = r;
                                    pagination.total = total;
                                    teacherList.value = list;
                                    resolve(null);
                            } )
                            .catch(() => reject())
                    })
                }
        ])
    };
    const beginAdd = () => {
        //表单清空
        FormRef.value?.resetFields();
        editModel.model.cls_id = 0;
        editModel.model.cls_name = '';
        editModel.model.cls_dic_id_major = 0;
        editModel.model.cls_clsr_id = 0;
        editModel.model.cls_stf_id_teacher= 0;
        editModel.model.cls_stf_id_admin = 0;
        editModel.model.cls_stf_id_job = 0;
        editModel.model.cls_begin = '';
        editModel.model.cls_end = '';
        editModel.model.cls_remark = '';
        nextTick(() => editModel.isEdit = true);
    };
    const beginUpdate = (data: any) => {
        FormRef.value?.resetFields();
        editModel.model.cls_id = data.cls_id;
        editModel.model.cls_name = data.cls_name;
        editModel.model.cls_dic_id_major = data.cls_dic_id_major;
        editModel.model.cls_clsr_id = data.cls_clsr_id;
        editModel.model.cls_stf_id_teacher= data.cls_stf_id_teacher;
        editModel.model.cls_stf_id_admin = data.cls_stf_id_admin;
        editModel.model.cls_stf_id_job = data.cls_stf_id_job;
        editModel.model.cls_begin = data.cls_begin;
        editModel.model.cls_end = data.cls_end;
        editModel.model.cls_remark = data.cls_remark;
        nextTick(() => editModel.isEdit = true);
    };
    const save = () => {
        
    };
    const classBegin = reactive<HttpPayload.classBegin>({ // 教室分配
    cls_clsr_id: 0,
    cls_id: 0
  })
    const rules = reactive<FormRules>({
        cls_name: [{required: true, message: '用户名不能为空', trigger: 'blur'}]
    });
   
    const distribution = async () => {
        await httpBatch([ () => ClsAPI.begin(classBegin),() => getData() ]);
        editModel.isBegin = false;
        ElMessage({ message: `新班级已开课`, type: 'success' });
  };

    onMounted(async () => {
        try {
            await getData();
            staffStore.categoryList.find(item => {
            if(item.dic_group_key === 'class_major') 
            classList.value.push(item);   
            teacherList.value.find(item => {
            if(item.stf_category === 4) {
                jiaoxueList.value.push(item);
            } else if(item.stf_category === 5) {
                jiaowuList.value.push(item);
            } else if(item.stf_category === 6) {
                jiuyeList.value.push(item);
            }
        })
        })} catch(e) {}   
    });
</script>

<template>
    <el-container>
        <el-header height="45px">
            <el-form inline>
                <el-form-item label="班级名称">
                    <el-input v-model="searchModel.cls_name" @change="getData()"></el-input>
                </el-form-item>
                <el-form-item label="班级专业">
                    <el-select v-model="searchModel.cls_dic_id_major" @change="getData()">
                        <el-option :value="0" label="- 请选择 -"></el-option>
                        <el-option v-for="item in classList" :value="item.dic_id" :label="item.dic_name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="班级状态">
                    <el-select v-model="searchModel.cls_status" @change="getData()">
                        <el-option :value="0" label="全部"></el-option>
                        <el-option :value="1" label="未开课"></el-option>
                        <el-option :value="2" label="开课"></el-option>
                        <el-option :value="3" label="结课"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                        <el-button :icon="Plus" type="primary" @click="beginAdd">新增</el-button>               
                </el-form-item>
            </el-form>
        </el-header>
        <el-main>
            <el-table border  :data="show">
                <el-table-column label="#" width="60px" align="center" type="index"></el-table-column>
                <el-table-column label="班级名称" prop="cls_name" width="90px"></el-table-column>
                <el-table-column label="班级专业" width="90px">
                    <template #default="{row}">
                        <span>{{staffStore.categoryList.find(item => item.dic_id === row.cls_dic_id_major)?.dic_name}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="教学老师" width="90px">
                    <template #default="{row}">
                        <span>{{teacherList.find(item => item.stf_id === row.cls_stf_id_teacher)?.stf_name}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="教务老师"  width="90px">
                    <template #default="{row}">
                        <span>{{teacherList.find(item => item.stf_id === row.cls_stf_id_admin)?.stf_name}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="就业老师" width="90px">
                    <template #default="{row}">
                        <span>{{teacherList.find(item => item.stf_id === row.cls_stf_id_job)?.stf_name}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="教室" width="100px">
                    <template #default="{row}">
                        <div style="display: flex;align-items: center;justify-content: center">
                            <el-icon style="margin-right: 5px; color: #409EFF" v-if="row.cls_begin && !row.cls_end"><DataLine/></el-icon>
                            <el-icon style="margin-right: 5px; color: #67C23A" v-if="row.cls_begin && row.cls_end"><DataLine/></el-icon>
                            <span>{{clsrStore.clsrList.find(item => item.clsr_id === row.cls_clsr_id)?.clsr_name}}</span>
                        </div>
                    </template> 
                </el-table-column>
                <el-table-column label="开课时间" prop="cls_begin" width="110px" style="color: ">
                    <template>
                        <el-icon><Calendar /></el-icon>
                    </template>
                </el-table-column>
                <el-table-column label="结课时间" prop="cls_end" width="110px"></el-table-column>
                <el-table-column label="班级状态" prop="cls_status" width="90px"></el-table-column>
                <el-table-column label="备注" prop="cls_remark" width="90px"></el-table-column>
                <el-table-column label="操作" width="450px">
                    <template #default="{row}">
                        <el-button type="primary" :icon="Edit" @click="beginUpdate(row)">修改</el-button>
                        <el-button type="success" :icon="Checked" @click="editModel.isBegin = true">开课</el-button>
                        <el-button type="danger" :icon="Failed">结课</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
        <el-footer></el-footer>
    </el-container>
    <el-dialog
    width="500px"
    :model-value="editModel.isEdit"
    :title="editModel.type === 1 ? '班级编辑 - 新增' : '班级编辑 - 修改'">
        <el-form :rules="rules" ref="FormRef" status-icon>
            <el-form-item label="班级名称" prop="cls_name"><el-input v-model="editModel.model.cls_name" ></el-input></el-form-item>
            <el-form-item label="班级专业"><el-select v-model="editModel.model.cls_dic_id_major">
                <el-option :value="0" label="- 请选择 -"></el-option>
                <el-option v-for="item in classList" :value="item.dic_id" :label="item.dic_name"></el-option>
            </el-select></el-form-item>
            <el-form-item label="教学老师"><el-select v-model="editModel.model.cls_stf_id_teacher">
                <el-option :value="0" label="- 请选择 -"></el-option>
                <el-option v-for="item in jiaoxueList" :value="item.stf_id" :label="item.stf_name">
                    <!-- <span>{{}}</span> -->
                </el-option>
            </el-select></el-form-item>
            <el-form-item label="教务老师"><el-select v-model="editModel.model.cls_stf_id_admin">
                <el-option :value="0" label="- 请选择 -"></el-option>
                <el-option v-for="item in jiaowuList" :value="item.stf_id" :label="item.stf_name"></el-option>
            </el-select></el-form-item>
            <el-form-item label="就业老师"><el-select v-model="editModel.model.cls_stf_id_job">
                <el-option :value="0" label="- 请选择 -"></el-option>
                <el-option v-for="item in jiuyeList" :value="item.stf_id" :label="item.stf_name"></el-option>
            </el-select></el-form-item>
            <el-form-item label="班级备注"><el-input type="textarea" placeholder="请输入内容" v-model="editModel.model.cls_remark"></el-input></el-form-item>
            
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="editModel.isEdit = false">取消</el-button>
                <el-button type="primary" @click="save">确定</el-button>
            </span>
        </template>
    </el-dialog>
    <!-- 教室分配 -->
    <el-dialog :model-value="editModel.isBegin"
                 width="500px"
                 center
                 draggable
                 :close-on-click-modal="false"
                 :close-on-press-escape="false"
                 :show-close="false">
          <template #header>
            <span>教室分配</span>
          </template>
        <template #default>
          <el-form style="display: flex; justify-content: center">
            <el-form-item label="班级：">
              <el-select v-model="editModel.model.cls_clsr_id" size="large" >
                <el-option :value="0" label="- 请选择 -"></el-option>
                <el-option v-for="item in clsrStore.clsrList"
                           :label="item.clsr_name"
                           :disabled="item.clsr_occupy === 1"
                           :value="item.clsr_id"
                           :key="item.clsr_id" ></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </template>
        <template #footer>
          <el-button type="info" size="large" @click="editModel.isBegin = false">取消</el-button>
          <el-button type="primary" size="large" @click="distribution">分配</el-button>
        </template>
      </el-dialog>
</template>

<style lang="stylus" scoped>

</style>