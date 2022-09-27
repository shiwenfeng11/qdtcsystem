<script setup lang="ts">
    import EduMenu from './EduMenu.vue';
    import EduTab from './EduTab.vue';
    import {onMounted,watch} from "vue";
    import {useDashboardStore} from "@/store";
    import {useRouter} from "vue-router";

    const router = useRouter();
    const dashboardStore = useDashboardStore();

    onMounted(async() => {
        try {
            await dashboardStore.getMenu();
        } catch(e) {}
    });
    watch(() => dashboardStore.activeFuncKey, (newFunKey: string) => {
            router.replace('/home/' + newFunKey)
    }, {flush: "post"})

</script>
<template>
   <el-container>
        <el-aside :width="dashboardStore.collapse ? '70px' : '300px'">
            <el-button style="background-color:#BC8F8F" @click=dashboardStore.collapseToggle() size="large">
                <el-icon v-if="dashboardStore.collapse" >
                    <d-arrow-right/>
                </el-icon>
                <el-icon v-else><d-arrow-left/></el-icon>
            </el-button>
            <el-menu background-color="#BC8F8F"
                    text-color="#fff" 
                    active-text-color="#8B4513" 
                    :collapse="dashboardStore.collapse"
                    @select="dashboardStore.openFunc"
                    :default-active="dashboardStore.activeFuncKey">
                    <EduMenu :list="dashboardStore.menuTree" />
            </el-menu>
        </el-aside>
      <el-container>
        <el-header height="70px">
            <h1>青职教学管理系统 -V1.0</h1>
        </el-header>
        <el-main>
            <EduTab />
        </el-main>
        <el-footer>
            <p>&copy;版权所有：青岛职业技术学院</p>
        </el-footer>
      </el-container>
    </el-container>
</template>

<style scoped lang="stylus">
.el-container 
    // background-image: url("../assets/photo/1.webp")
    .el-aside 
        background-color #BC8F8F
        transition: width 0.3s
        .el-icon 
            font-size 18px
        .el-menu 
            border-right none
    .el-header 
        background-color #778899
        display flex
        align-items center
        h1 
            font-size 30px 
            color #fff 
            letter-spacing 10px 
            text-shadow 6px 6px 0 #000
    .el-footer 
        background-color #778899
        display flex 
        align-items center        
</style>