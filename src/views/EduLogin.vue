<script setup lang="ts">
import {reactive,ref} from 'vue';
import {FormRules,FormInstance,ElMessage} from 'element-plus';
import {useRouter} from "vue-router";
import {UserAPI} from '@/api';
import {useAuthStore} from "@/store";

const router = useRouter();
const formRef = ref<FormInstance | null>(null)
const model = reactive<HttpPayload.Login>({user_name: "", user_pwd: ""});
//定制校验规则
const rules:FormRules = {
    user_name:[
        { required: true, message: '用户名不能为空', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度3-20', trigger: 'blur' },
    ],
    user_pwd: [
        {required: true, message: "密码不能为空", trigger: "blur"},
        {min: 3, max: 20,message: "用户密码3-20", trigger: "blur"}
    ]
}
const login = async() => {
    try {
        //表单校验
        await formRef.value?.validate();
        //发送ajax 
        const token = await UserAPI.login(model);
        //将token|name存入pinia
        const authStore = useAuthStore();
        authStore.login(model.user_name,token);
        //提示登陆成功
        ElMessage({
            message: "登陆成功",
            type: "success",
            showClose: true,
            customClass: "messageIndex"
        });
        //路由跳转
        router.replace("/home");
    } catch(e: Error) {e.message}
}
</script>

<template>
    <el-form :model="model" :rules="rules" status-icon ref="formRef">
        <el-form-item>
            <h1>青职教学管理系统</h1>
        </el-form-item>
        <el-form-item prop="user_name">
            <el-input v-model.trim="model.user_name">
                <template #prepend>
                    <span class="input-tip">用户名:</span>
                </template>
                <template #append>
                    <el-icon><User /></el-icon>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item prop="user_pwd">
            <el-input  v-model="model.user_pwd" type="password">
                <template #prepend>
                    <span class="input-tip" >密码:</span>
                </template>
                <template #append>
                    <el-icon><Lock /></el-icon>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="login">登录系统</el-button>
        </el-form-item>
    </el-form>
</template>

<style scoped lang="stylus">
    .el-form 
        padding 20px 50px 
        box-shadow 0 0 10px 0 #b0b0b0
        width 400px
        position fixed 
        top 50% 
        left 50% 
        transform: translateY(-50%);
    .el-button 
        margin 0 auto 
    .input-tip
        width 50px 
        text-align right
</style>