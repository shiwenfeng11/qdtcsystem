<script setup lang="ts">
    import {Plus,Edit, Delete,Message,Close} from '@element-plus/icons-vue';
    import {useFuncStore} from '@/store';
    import {onMounted, watch,reactive,nextTick,ref} from "vue";
    import {ElMessageBox, ElMessage, FormInstance} from "element-plus";
    import appFuncs from "@/views";

   
    const funcStore = useFuncStore();
    const remove = async (func: Vm.TreeDataItem) => {
       await ElMessageBox.confirm(
            `确定删除: ${func.func_name}?`,
            "Tip",
            {showClose: false, type: "warning"}
        );
        await funcStore.remove(func.func_id);
        ElMessage({message: `删除${func.func_name}成功`,type: "success"})
    };
    onMounted(async() => {
        try {
            await funcStore.init();
    } catch(e) {}
});
    const edit = reactive({
        isEdit: false,
        isLeaf: false,
        model: {func_name: '', func_id: 1, func_key: '',func_fid: 0}
    });
    const beginAdd = (func: Vm.TreeDataItem) => {
        edit.model = {func_id: 0, func_name: "", func_key: "", func_fid: func.func_id }
        edit.isLeaf = false;
        formRef.value?.resetFields(); //清除上一次残留
        nextTick(() => edit.isEdit = true);
    };
    const beginUpdate = (func: Vm.TreeDataItem) => {
        edit.model = {
            func_id: func.func_id,
            func_name: func.func_name,
            func_key: func.func_key,
            func_fid: func.func_fid
        };
        edit.isLeaf = func.func_key !== '';
        formRef.value?.resetFields(); //清除上一次残留
        nextTick(() => edit.isEdit = true);
    };
    const save = async () => {
        try {
            formRef.value?.validate();
            if(edit.model.func_id === 0) 
                await funcStore.add(edit.model);
            else
                 await funcStore.update(edit.model);
            edit.isEdit = false;
            ElMessage({message: `功能编辑成功，请重新登录以启用最新菜单`, type: "success"})
        } catch(e: any) {console.log(e.message)}
    }
    watch(() => edit.isLeaf, newValue => {
        if(!newValue) edit.model.func_key = '';
    });
    //表单验证
    const formRef = ref<FormInstance>();
    const rules = {
        func_name: [{
            validator:(rule: any, value: string, cb: any) => {
                if(value.length === 0)
                    cb(new Error('*功能名称不能为空'));
                else if(value.length < 2 || value.length > 50)
                    cb(new Error('*功能名称长度 2 - 50'));
                else if(funcStore._allFuncs.some(item => 
                item.func_id !== edit.model.func_id &&
                item.func_name === edit.model.func_name && 
                item.func_fid === edit.model.func_fid
                ))
                    cb(new Error(`*当前父节点下已存在: "${value}" 节点`));
                else 
                    cb(); //验证通过
            },trigger: "blur"}],
        func_fid: [{
            validator:(rule: any, value: string, cb: any) => {
                if(edit.model.func_id !== 0) {
                    formRef.value?.validateField('func_name',() => null);
                cb()}
            },trigger: "change"}],
        func_key: [{
            validator:(rule: any, value: any, callback: any) => {
                if(edit.isLeaf && value === '') {
                    callback(new Error('*叶子节点下必须选择功能模块'))
                }
            },
            trigger: "change"}]
    };
</script>

<template>
    <el-tree :default-expand-all="true" 
    :expand-on-click-node="false" 
    class="custom-tree" 
    :data="funcStore.TreeData">
        <template #default="{data}">
            <span class="custom-tree-node">
                <span class="left"><el-icon><Paperclip /></el-icon><span v-text="data.func_name"></span></span>
                <span>
                    <el-button type="text" :icon="Plus" v-if="data.func_key === ''" @click="beginAdd(data)"></el-button>
                    <el-button type="text" :icon="Edit" v-if="![0, 1, 2].includes(data.func_id)" @click="beginUpdate(data)"></el-button>
                    <el-button type="text" :icon="Delete" v-if="![0, 1, 2].includes(data.func_id)" :disabled="data.children" @click="remove(data)"></el-button>
                </span>
            </span>
        </template>
    </el-tree>
    <el-dialog
        :width="500" 
        :model-value="edit.isEdit"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        >
        <template #header>
            <h5>功能新增-修改</h5>
        </template>
        <el-form label-width="120px" :model="edit.model"
        :rules="rules" status-icon>
            <el-form-item label="功能类型:">
                <el-radio-group v-model="edit.isLeaf" :disabled="edit.model.func_id !== 0">
                    <el-radio :label="false">非叶子节点</el-radio>
                    <el-radio :label="true">叶子节点</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="父级功能:" prop="func_fid">
                <el-select size="large" v-model="edit.model.func_fid" :disabled="edit.model.func_id === 0">
                    <el-option :value="0" label="Root"></el-option>
                    <el-option
                            v-for="item in funcStore.noLeafFuncs"
                            :key="item.func_id"
                            :value="item.func_id"
                            :label="item.func_name"
                            :disabled="item.func_id === edit.model.func_id"
                            ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="功能名称:" v-model.trim.lazy="edit.model.func_name" prop="func_name">
                <el-input size="large" v-model.trim.lazy="edit.model.func_name"></el-input>
            </el-form-item>
            <el-form-item label="功能绑定模块:" v-show="edit.isLeaf" prop="func_key">
                <el-select size="large" v-model.trim.lazy="edit.model.func_key">
                    <el-option value="" label="- 请选择 -"></el-option>
                    <el-option 
                        :disabled="funcStore._allFuncs.findIndex(item => item.func_key === k) !== -1"
                        v-for="(v,k) in appFuncs"
                        :label="v" :value="k" 
                        ></el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button type="primary" :icon="Message" @click="save">确定</el-button>
            <el-button :icon="Close" @click="edit.isEdit = false">取消</el-button>
        </template>
    </el-dialog>
</template>

<style lang="stylus">
    .custom-tree 
        width 500px 
        .custom-tree-node 
            flex-grow 1 
            display flex 
            align-items center 
            justify-content space-between 
            .left 
                display flex 
                align-items center
                .el-icon 
                    margin-right 10px
                    color var(--el-color-primary)
    h5 
        height 50px
        display flex
        background-color var(--el-color-primary)
        font-size 18px
        align-items center
        justify-content center
        color #fff
        font-weight normal
        border-radius 10px 10px
       
</style>