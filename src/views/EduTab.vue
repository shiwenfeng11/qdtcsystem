<script setup lang="ts">
    import {useDashboardStore} from '@/store';

    const dashboardStore = useDashboardStore();

</script>

<template>
    <el-tabs type="border-card" 
        closable @tab-remove="dashboardStore.closeFunc"
        v-model="dashboardStore.activeFuncKey">
        <el-tab-pane 
            v-for="item in dashboardStore.openFuncs" 
            :key="item.func_id"
            :label="item.func_name"
            :name="item.func_key">
            <router-view :name="item.func_key" v-slot="{Component}">
                <keep-alive>
                    <component :is="Component"></component>
                </keep-alive>
            </router-view>
        </el-tab-pane>
    </el-tabs>
</template>

<style lang="stylus">

</style>