<script setup lang="ts">
    import {ElMessageBox, ElMessage,FormInstance} from 'element-plus';
    import {Search,Edit, Setting, Delete,Plus, Close, Message} from '@element-plus/icons-vue';
    import {useRoleStore} from '@/store';
    import {onMounted,reactive,ref,nextTick} from 'vue';
    import {UserAPI} from '@/api';
    import {httpBatch} from '@/utils/http';


    const roleStore = useRoleStore();
    const searchModel = reactive<HttpPayLoad.UserSearch>({
        user_name: "", role_id: -1, begin: 0, pageSize: 5
    });
    const pagination = reactive({
        total: 0, currentPage: 1
    });
    const userList = ref<Vm.User[]>([]);
    const edit = reactive<{isEdit: boolean, type: 1 | 2, model: HttpPayLoad.ConfigRole}>({
        type: 1,
        isEdit: false,
        model: {
            user_name: "",
            role_id: 0
        }
    });
    const formRef = ref<FormInstance>();
    const rules = {
        user_name: [
            {required: true, message: "* 用户名不能为空", trigger: "blur"},
            {min: 2, max: 20, message: "* 用户名长度2-20", trigger: "blur"}
        ]
    };
    const tableRef = ref<any>(null)
    //核心代码
    const getData = async (fromPage1 = true) => {
        if(fromPage1) pagination.currentPage = 1;
        searchModel.begin = (pagination.currentPage - 1) * searchModel.pageSize;
        try {
            const {total, list} = await UserAPI.get(searchModel);
            if(total > 0 && list.length === 0) {
                pagination.currentPage = Math.ceil(total / searchModel.pageSize);
                await getData(false);
                return;
            }
            pagination.total = total;
            userList.value = list;
        } catch(e) {}
    }
    onMounted(async () => {
        try {
            // await roleStore.init();
            // await getData();
            await httpBatch([() => roleStore.init(), () => getData()]);
        } catch(e: any) {console.log(e.message)}
    });
    const getIndex = (rowIndex: number) => {
        return (pagination.currentPage - 1) * searchModel.pageSize + rowIndex + 1;
    };
    const remove = async (user: Vm.User) => {
      try {
        await ElMessageBox.confirm(
            `确定删除: ${user.user_name}?`,
            "Tip",
            {showClose: false, type: "warning"}
        );
        // await UserAPI.remove(user.user_name);
        await httpBatch([() => UserAPI.remove(user.user_name), () => getData(false)],true);
        ElMessage({message: `删除用户: "${user.user_name}" 成功`,type: "success"})
     //删除的是最后一行怎么办: 
     //更新页面: 
     await getData(false);
     } catch(e) {}
    };
    const resetPwd = async (user: Vm.User) => {
      try {
        await ElMessageBox.confirm(
            `你确定要重置: ${user.user_name} 的密码吗?`,
            "Tip",
            {showClose: false, type: "warning"}
        );
        // await UserAPI.remove(user.user_name);
        await UserAPI.resetPwd(user.user_name);
        ElMessage({message: `用户: "${user.user_name}" 的密码重置成功!`,type: "success"})
        //删除的是最后一行怎么办: 
        //更新页面: 
        await getData(false);
     } catch(e) {}
    };
    const beginAdd = () => {
        edit.type = 1;
        formRef.value?.resetFields();
        edit.model.user_name = "";
        nextTick(() => edit.isEdit = true);
    };
    const beginConfigRole = (user: Vm.User) => {
        edit.type = 2;
        formRef.value?.resetFields();
        edit.model.user_name = user.user_name;
        edit.model.role_id = user.role_id || 0;
        nextTick(() => edit.isEdit = true);
    };
    const save = async () => {
        try {
            if(edit.type === 1) {
                //强制表单进行验证
                //判断user_name存不存在
                //发送ajax新增用户
                //t跳到第一页并把新增的那条选中
                //提示用户新增成功
                //把弹窗关了
                await formRef.value?.validate();
                const r = await UserAPI.validateName(edit.model.user_name)
                if(r === 1) {
                    ElMessageBox.alert("用户: ${edit.model.user_name} 已存在", "警告", {type: "error"});
                    return;
                }
                searchModel.user_name = "";
                searchModel.role_id = -1;
                await httpBatch([() => UserAPI.add(edit.model.user_name), () => getData()], true);
                edit.isEdit = false;
                ElMessage({message: `用户: ${edit.model.user_name} 新增成功！`, type: "success", customClass: "messageIndex"})
                //下一时间片，让新增的数据在表格中高亮显示
                nextTick(() => {
                    let i = userList.value.findIndex(item => item.user_name === edit.model.user_name);
                    tableRef.value.setCurrentRow(userList.value[i]);
                })
            } else {
                await UserAPI.configRole(edit.model);
                const i = userList.value.findIndex(item => item.user_name === edit.model.user_name)
                userList.value[i].role_id = edit.model.role_id === 0 ? null : edit.model.role_id;
                edit.isEdit = false;
                ElMessage({message: `用户: ${edit.model.user_name} 角色分配成功！`, type: "success",customClass:"messageIndex"})
            }
    } catch(e: any) {console.log(e.message)}     
    };
    
</script>

<template>
    <el-container>
        <el-header height="50px">
            <el-form inline>
                <el-form-item label="用户名字: ">
                    <el-input
                     placeholder="请输入内容.." 
                    :prefix-icon="Search"
                    v-model="searchModel.user_name"
                    @change="getData()"></el-input>
                </el-form-item>
                <el-form-item label="用户角色: ">
                    <el-select @change="getData()" v-model="searchModel.role_id">
                        <el-option :value="-1" label="- 全部"></el-option>
                        <el-option :value="0" label="- 无角色"></el-option>
                        <el-option 
                        v-for="item in roleStore.roleList" 
                        :key="item.role_id"
                        :value="item.role_id"
                        :label="item.role_name">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
        </el-header>
        <el-main>
            <el-table :data="userList" stripe border highlight-current-row>
                <el-table-column type="index" label="#" align="center" :index="getIndex"></el-table-column>
                <el-table-column  prop="user_name" label="用户名"></el-table-column>
                <el-table-column prop="role_id" label="角色">
                    <template #default="{row}">
                        <span v-if="row.role_id">{{roleStore.roleList.find(item => item.role_id === row.role_id)?.role_name}}</span>
                        <span v-else>- 无角色 -</span>
                    </template>
                </el-table-column>
                <el-table-column>
                    <template #header>
                        <el-button :icon="Plus" type="success" @click="beginAdd">新增</el-button>
                    </template>
                    <template #default="{row}">
                        <el-button :icon="Edit" type="primary" @click="resetPwd(row)">重置密码</el-button>
                        <el-button :icon="Setting" type="warning" @click="beginConfigRole(row)">分配角色</el-button>
                        <el-button :icon="Delete" type="danger" @click="remove(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
        <el-footer height="36px">
            <el-pagination 
            background
            :total="pagination.total"
            :page-sizes="[5,8,10,12,15]"
            layout="prev, pager,next,jumper,->,sizes,total"
            v-model:page-size="searchModel.pageSize"
            v-model:current-page="pagination.currentPage"
            @size-change="getData()"
            @current-change="getData(false)"
            />
        </el-footer>
    </el-container>
    <el-dialog
            :width="500" 
            :model-value="edit.isEdit"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            :show-close="false"
            :title="edit.type === 1 ? '新增用户' : '用户角色分配'">
            <el-form label-width="120px" :model="edit.model" :rules="rules" ref="formRef">
                <el-form-item label="用户名字: " prop="user_name">
                    <el-input
                     placeholder="请输入用户名" 
                    v-model="edit.model.user_name"
                    :disabled="edit.type === 2"></el-input>
                </el-form-item>
                <el-form-item label="用户角色: " v-show="edit.type === 2">
                    <el-select v-model="edit.model.role_id">
                        <el-option :value="0" label="- 无角色"></el-option>
                        <el-option 
                        v-for="item in roleStore.roleList" 
                        :key="item.role_id"
                        :value="item.role_id"
                        :label="item.role_name">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button type="primary" :icon="Message" @click="save">确定</el-button>
                <el-button :icon="Close" @click="edit.isEdit = false">取消</el-button>
            </template>
        </el-dialog>
</template>

<style lang="stylus" scoped>

</style>