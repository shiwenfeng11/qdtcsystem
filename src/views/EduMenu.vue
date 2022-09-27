<script setup lang="ts">
type MenuTreeItem = Vm.Func & {children?: MenuTreeItem[]};
interface PropType {
    list: MenuTreeItem[]
}
defineProps<PropType>();

</script>

<template>
     
        <template v-for="item in list" :key="item.id">
            <el-sub-menu v-if="item.func_key === ''" :index="item.func_id.toString()">
                <template #title>
                    <el-icon><setting /></el-icon>
                    <span style="font-size: 18px" v-text="item.func_name"></span>
                </template>
                <EduMenu v-if="item.children" :list="item.children"/>
            </el-sub-menu>
            <el-menu-item v-else :index="item.func_key.toString()">
                <el-icon><Menu /></el-icon>
                <span style="font-size: 18px" v-text="item.func_name"></span>
            </el-menu-item>
        </template>      
</template>

<style lang="stylus">
    
</style>