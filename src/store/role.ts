import {RoleAPI} from '@/api';
import {defineStore} from 'pinia';
import {ref} from 'vue';

export default defineStore(
    'role',
    () => {
        const _isInit = ref<boolean>(false);
        const roleList = ref<Vm.Role[]>([]);

        const init = async () => {           
                if(_isInit.value) return;
                roleList.value = await RoleAPI.getAll();
                _isInit.value = true;           
        }
        
        return {init,roleList};
    },
    {persist: {enabled: true}}
)