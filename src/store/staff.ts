import {StaffAPI} from '@/api';
import {defineStore} from 'pinia';
import {ref,reactive} from 'vue';

export default defineStore(
    'staff',
    () => {
        const categoryList = ref<Vm.StaffCategory[]>([]);
        const _init = ref<boolean>();
        const init = async () => {
            if(_init.value) return;
            categoryList.value = await StaffAPI.getAll();
            _init.value = false;        
        }
        
        return {categoryList, _init, init}
    },
    {persist: {enabled: true}}
)