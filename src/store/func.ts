import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import {FuncAPI} from '@/api';
import func from '@/api/func';

export default defineStore('func',
        () => {
            const _isInit = ref<boolean>(false); //标识_allFuncs初始化了没有
            const _allFuncs = ref<Vm.Func[]>([]);
            const TreeData = computed<Vm.TreeData>(() => {
                function _updateNode(node: Vm.TreeDataItem) {
                    let children: Vm.TreeDataItem[] = [];
                    _allFuncs.value.forEach(item => {if(item.func_fid === node.func_id) children.push({...item})});
                    //实现数组转树
                    if(children.length === 0) return;
                    else {
                        node.children = children;
                        node.children.forEach(item => _updateNode(item));
                    }
                }
               var root: Vm.TreeDataItem = {func_id: 0,func_name: "Root",func_key: '',func_fid: -1}
               _updateNode(root);
               return [root];
            })
            const init = async () => {
                //发送ajax请求所有的功能，保存在_allFuncs中
                if(_isInit.value) return;
                _allFuncs.value = await FuncAPI.getAll();
                _isInit.value = true;
            };
            const remove = async (id: number) => {
                try {
                    await FuncAPI.remove(id);
                    var i = _allFuncs.value.findIndex(item => item.func_id === id);
                    _allFuncs.value.splice(i,1);
                } catch(e) {}
            };
            const add = async (func: HttpPayLoad.Func) => {
                const func_id = await FuncAPI.add(func);
                _allFuncs.value.push({...func,func_id})
            };
            const update = async (func: HttpPayLoad.Func) => {
                await FuncAPI.update(func);
                const i = _allFuncs.value.findIndex(item => item.func_id === func.func_id);
                _allFuncs.value.splice(i, 1, {...func})
            };
            const noLeafFuncs = computed<Vm.Func[]>(() => {
                return _allFuncs.value.filter(item => item.func_key === '' )
            });
            return {init, TreeData,_isInit, _allFuncs, remove, noLeafFuncs, add, update}      
        },
        {persist: {enabled: true}})