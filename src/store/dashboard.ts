import {defineStore} from 'pinia';
import {ref,markRaw,computed,reactive,watch} from 'vue';
import {UserAPI} from '@/api';
import {TabPanelName} from "element-plus";
import { tr } from 'element-plus/es/locale';

export default defineStore(
    "dashboard",
    () => {
        const collapse = ref<boolean>(false);
        const collapseToggle = () => collapse.value = !collapse.value;
        const userMenu = ref<Vm.Func[]>(markRaw([]));
        //先定义类型
        type MenuTreeItem = Vm.Func & {children?: MenuTreeItem[]};
        const menuTree = computed<Array<MenuTreeItem>>(() => {
            function _updateNode(node: MenuTreeItem) {
                let children: MenuTreeItem[] = [];
                userMenu.value.forEach(item => {if(item.func_fid === node.func_id) children.push({...item})});
                //实现数组转树
                if(children.length === 0) return;
                else {
                    node.children = children;
                    node.children.forEach(item => _updateNode(item));
                }
            }
           let result: Array<MenuTreeItem> = [];
           userMenu.value.forEach(item => {if(item.func_fid === 0) result.push({...item})});
           result.forEach(item => _updateNode(item));
           return result;
        })
        const getMenu = async() => {
            userMenu.value = markRaw(await UserAPI.getMenu());
        }
        const openFuncs = reactive<Vm.Func[]>([]);
        const openFunc = (func_key: string) => {
            if(openFuncs.findIndex(item => item.func_key === func_key) === -1) {
               let target = userMenu.value.find(item => item.func_key === func_key) as Vm.Func;
                openFuncs.push({...target})
            }
            activeFuncKey.value = func_key;
        };
        const closeFunc = (func_key: TabPanelName) => {
           let i = openFuncs.findIndex(item => item.func_key === func_key);
           if(func_key !== activeFuncKey.value) {}
           else if(openFuncs.length === 1) {activeFuncKey.value = ""}
           else if(i === openFuncs.length - 1) {activeFuncKey.value = openFuncs[i - 1].func_key}
           else activeFuncKey.value = openFuncs[i + 1].func_key;
           openFuncs.splice(i, 1);
        }
        const activeFuncKey = ref<string>(""); //标识当前激活功能的funckey
        

        return {collapse,collapseToggle,getMenu,
            menuTree,openFuncs,openFunc,closeFunc,userMenu,
            activeFuncKey};
    },
    {persist: {
        enabled: true,
        
    }}
)