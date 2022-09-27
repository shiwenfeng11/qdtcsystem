<script setup lang="ts">
    import {onMounted, reactive,nextTick, ref} from 'vue';
    import { useRoleStore,useFuncStore } from '@/store';
    import {Edit, Setting, Delete,Message, Close} from '@element-plus/icons-vue';
    import { httpBatch } from '@/utils/http';
    import {RoleAPI} from '@/api';
    import { ElMessage, ElMessageBox, FormInstance,FormRules} from 'element-plus';

    const ruleFormRef = ref<FormInstance>();
    const roleStore = useRoleStore();
    const funcStore = useFuncStore();
    const treeRef = ref<any>(null);
    const roleModel = reactive<{isEdit: boolean,type: 1 | 2, model: HttpPayLoad.Role}>({
        isEdit: false,
        type: 1,
        model: {
            role_id: 0,
            role_name: ""
        }
    });
    const roleFunc = reactive<{
        isSetting: boolean,
        currentFuncs: Vm.Func[],
        model: HttpPayLoad.RoleFunc
    }>({
        isSetting:false,
        currentFuncs: [],
        model: {
            role_id: 0,
            role_func_ids: ""
        }
    });


    const echoFuncs = () => {
        treeRef.value.setCheckedKeys(roleFunc.currentFuncs.reduce((result: Number[], item: Vm.Func) => {
            if(item.func_key !== '') result.push(item.func_id);
            return result;
        }, []))
    }

    const beginRoleFunc = async (role_id: number) => {
        //赋值
        roleFunc.model.role_id = role_id;
        const funcs = await RoleAPI.getRoleFuncs(role_id);
        //发送ajax
        roleFunc.currentFuncs = funcs;
        nextTick(() => {
            roleFunc.isSetting = true;
            nextTick(() => echoFuncs())        
        });
    };

    const saveRoleFunc = async () => {
        //将el-tree中勾选和半勾选(root除外)的节点的key搜集放在一个数组中
        const checkedKeys = [...treeRef.value.getHalfCheckedKeys(), ...treeRef.value.getCheckedKeys()];
        if(checkedKeys.length > 1) checkedKeys.shift();
        roleFunc.model.role_func_ids = checkedKeys.join(',');
        //发送ajax保存
        await RoleAPI.saveRoleFuncs(roleFunc.model);
        //关闭el-tree
        roleFunc.isSetting = false;
        //提示用户操作成功\
        ElMessage({message: `角色功能设置成功！`, type: "success",customClass:'messageIndex'})
    };

    const remove = async (index: HttpPayLoad.Role) => {
        await ElMessageBox.confirm(
            `确定删除角色: ${index.role_name} 吗?`,
            'Tip',
            {type: "warning",showClose: false}
        );
        await RoleAPI.remove(index.role_id);
        const i = roleStore.roleList.findIndex(item => item.role_id === index.role_id);
        roleStore.roleList.splice(i, 1);
        ElMessage({message: `角色: "${index.role_name}" 删除成功`, type:"success", customClass: "messageIndex"});
    };
    const beginAdd = async () => {
        //开始新增
        roleModel.type = 1;
        //表单重置
        ruleFormRef.value?.resetFields();
        //清空数据
        roleModel.model.role_name = "";
        //弹窗弹出
        nextTick(() => roleModel.isEdit = true);
    };
    const beginUpdate = (item: Vm.Role) => {
        //开始修改
        roleModel.type = 2;
        //表单重置
        ruleFormRef.value?.resetFields();
        //回显数据
        roleModel.model.role_id = item.role_id;
        roleModel.model.role_name = item.role_name;
        //弹窗弹出
        nextTick(() => roleModel.isEdit = true);
    };
    const save = async () => {
        if(roleModel.type === 1) {
            //表单校验
            ruleFormRef.value?.validate();
            //验证用户名是否存在
            // const r = await RoleAPI.validateName(roleModel.model.role_name);
            // if(r === 1) {
            //     ElMessageBox.alert(
            //         `用户名: ${roleModel.model.role_name} 已存在`,
            //          '警告', 
            //          {type: "error"})
            // }
            //发送ajax 
            let role_id = await RoleAPI.add(roleModel.model);
            roleStore.roleList.push({...roleModel.model,role_id});
            nextTick(() => roleModel.isEdit = false);
            ElMessage({message:'新增成功', type: "success", customClass: 'messageIndex'});
        } else {
            //发送ajax
            await RoleAPI.edit(roleModel.model);
            let i = roleStore.roleList.findIndex(item => item.role_id === roleModel.model.role_id);
            roleStore.roleList.splice(i, 1, {...roleModel.model} );
            nextTick(() => roleModel.isEdit = false);
            ElMessage({message: '修改成功', type: "success", customClass: 'messageIndex'});
        }
    };
    const rules = reactive<FormRules>({
        role_name: [
            {required: true, message: '角色名称不能为空', trigger: 'blur'},
            {min: 2, max: 10, message: '角色名称为2 - 10', trigger: 'blur'}
        ]
    });
    onMounted(async () => {
        try {
            await httpBatch([() => roleStore.init(), () => funcStore.init()])
        } catch(e: any) {console.log(e.message)}
    });
    
</script>

<template>
    <el-row :gutter="20">
        <el-col :span="6"  v-for="item in roleStore.roleList">
            <el-card>
                <template #header>
                    <h5 v-text="item.role_name"></h5>
                </template>
                    <el-button :icon="Edit" @click="beginUpdate(item)">编辑</el-button>
                    <el-button :icon="Setting" @click="beginRoleFunc(item.role_id)">绑定功能</el-button>
                    <el-button :icon="Delete" @click="remove(item)">删除</el-button>               
            </el-card>     
        </el-col>
        <el-col :span="6">
            <el-card class="add" @click="beginAdd">+</el-card>
        </el-col>
    </el-row>
    <el-drawer 
        :model-value="roleFunc.isSetting"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :with-header="false" 
        node-key="func_id">
        <el-container>
            <el-header height="40px">
                <h6>角色功能绑定</h6>
            </el-header>
            <el-content>
                <el-tree
                default-expand-all
                show-checkbox
                :data="funcStore.TreeData"
                :props="{label: 'func_name'}"
                class="custom-tree"
                ref="treeRef"
                node-key="func_id"
                >
                </el-tree>
            </el-content>
            <el-footer>
                <el-button :icon="Message" @click="saveRoleFunc">确定</el-button>
                <el-button @click="echoFuncs">重置</el-button>
                <el-button :icon="Close" @click="roleFunc.isSetting = false">取消</el-button>
            </el-footer>
        </el-container>
    </el-drawer>
    <el-dialog 
        width="30%"
        :model-value="roleModel.isEdit"
        :title="roleModel.type === 1 ? '功能修改 —— 新增' : '功能修改 —— 修改'"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        >
        <el-form 
              ref="ruleFormRef"
              :rules="rules"
              :model="roleModel.model"                     
            >
            <el-form-item label="角色名称" prop="role_name">
                <el-input v-model="roleModel.model.role_name" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="roleModel.isEdit = false">Cancel</el-button>
                <el-button type="primary" @click="save">Confirm</el-button>
            </span>
        </template>
  </el-dialog>
</template>

<style lang="stylus" scoped>
    .el-row 
        width 100%
        .el-card 
            min-height 130px
            &.add 
                display flex
                align-items center 
                justify-content center 
                font-size 35px
    .el-drawer    
        .el-container 
            height 100%
            .el-header 
                font-size 25px
                background-color var(--el-color-primary)
                color #fff
                display flex 
                align-items center 
                width 200px
                justify-content center
            el-content 
                flex-grow 1
            .el-footer 
                display flex 
                align-items center 
                justify-content flex-end                        
</style>