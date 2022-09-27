<script setup lang="ts">
    import {onMounted,ref,reactive, nextTick} from 'vue';
    import {useClsrStore} from '@/store';
    import {Edit, Delete} from "@element-plus/icons-vue";
    import {ElMessage, ElMessageBox, FormInstance, FormRules} from 'element-plus';
    import { ClsrAPI } from '@/api';
    import {httpBatch} from '@/utils/http';


    const clsrStore = useClsrStore();
    const ruleFormRef = ref<FormInstance>();
    const editModel = reactive<{type: 1 | 2, isEdit: boolean, model: HttpPayload.clsrEdit}>({
        type: 1,
        isEdit: false,
        model: {
            clsr_id: 0,
            clsr_name: ""
        }
    });

    const rules = reactive<FormRules>({
        clsr_name: [
            {validator: (rule: any, value: string, callback: any) => {
                if(value.length === 0) callback('班级名称不能为空');
                else if(value.length < 2 && value.length > 10) callback('班级名称2 - 10');
                else if(clsrStore.clsrList.some(item => item.clsr_name === value)) callback(new Error(`${value} 已存在`));
                else callback();
            },
            trigger: 'blur'
        }]
    });
    const getData = async () => {
        await clsrStore.init();
    };
    const remove = async (item: Vm.Classroom) => {
        await ElMessageBox.confirm(
            `确定删除: ${item.clsr_name}?`,
            '提示',
            {type: 'warning'}
        );
        await httpBatch([() => ClsrAPI.remove(item.clsr_id), () => getData()], true);
        ElMessage({
            message: `${item.clsr_name} 删除成功`,
            type: "success",
            customClass: 'messageIndex' 
           })
    };
    const beginAdd = () => {
        editModel.type = 1;
        ruleFormRef.value?.resetFields();
        editModel.model.clsr_name = "";
        nextTick(() => {editModel.isEdit = true});
    };
    const beginUpdate = (data: HttpPayload.clsrEdit) => {
        editModel.type = 2;
        ruleFormRef.value?.resetFields();
        editModel.model.clsr_id = data.clsr_id;
        editModel.model.clsr_name = data.clsr_name;
        nextTick(() => {editModel.isEdit = true});
    };
    const save = async () => {
        if(editModel.type === 1) {
            await ruleFormRef.value?.validate();
            await httpBatch([() => ClsrAPI.add(editModel.model),() => getData()],true);
            nextTick(() => {editModel.isEdit = false});
            ElMessage({
                message: `${editModel.model.clsr_name} 新增成功`,
                type: "success",
                customClass: 'messageIndex' 
           })
        } else {
            await ruleFormRef.value?.validate();
            await httpBatch([() => ClsrAPI.update(editModel.model),() => getData()], true);
            nextTick(() => {editModel.isEdit = false});
            ElMessage({
                message: `${editModel.model.clsr_name} 修改成功`,
                type: "success",
                customClass: 'messageIndex' 
           })
        }
    };
    onMounted(() => {
        try {
            getData();
        } catch(e: any) {console.log(e.message)}
    })
</script>

<template>
    <el-container>
        <el-header height="30px">
            <span>
                 <el-button type="success" circle size="small"></el-button>
                 空闲
            </span>
            <span>
                <el-button type="warning" circle size="small"></el-button>
                使用中
            </span>            
        </el-header>
        <el-main>
            <el-row :gutter="12">
                <el-col :span="6" v-for="item in clsrStore.clsrList">
                    <el-card v-if="item.clsr_occupy === 0" shadow="hover"  style="background-color: var(--el-color-success)">                   
                            <el-icon style="margin-right: 10px"><Monitor /></el-icon>
                            <span v-text="item.clsr_name" style="color: #fff"></span>
                            <div>
                                <el-button link :icon="Edit" size="large" @click="beginUpdate(item)"></el-button>
                                <el-button link :icon="Delete" size="large" @click="remove(item)"></el-button>
                            </div>                 
                    </el-card>
                    <el-card v-else shadow="hover" style="background-color: var(--el-color-warning)">
                        <el-icon style="margin-right: 10px"><Monitor /></el-icon>
                        <span v-text="item.clsr_name" style="color: #fff"></span>
                        <div>
                            <el-button link :icon="Edit" size="large" @click="beginUpdate(item)"></el-button>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6" >
                    <el-card shadow="hover" style="font-size: 30px" @click="beginAdd"> + </el-card>
                </el-col>
            </el-row>
        </el-main>
    </el-container>
    <el-dialog 
    width="30%" 
    :title="editModel.type === 1 ? '功能修改——新增' : '功能修改——修改'"
    :model-value="editModel.isEdit"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
        <el-form
        :model="editModel.model"
        ref="ruleFormRef"
        :rules="rules"
        status-icon>
            <el-form-item label="班级名称" size="large" prop="clsr_name" >
                <el-input v-model="editModel.model.clsr_name"/>
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
    span 
        margin-right 50px
    .el-icon
        color #fff
    .el-card 
        height 130px 
        display flex 
        align-items center 
        justify-content center
        border-radius 10px 10px
        margin-bottom 10px
        position relative
        &:hover div 
            opacity  1       
        div 
            opacity 0
            position absolute 
            top 0 
            left 0
            display none
            height 100% 
            width 100% 
            background-color rgba(0, 0, 0, 0.5)
            display flex 
            justify-content center 
            align-items center 
            .el-button 
                color #fff
                font-size 27px 
   
</style>