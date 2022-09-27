import {defineStore} from 'pinia';
import {ref} from 'vue';
import {ClsAPI} from '@/api';

export default defineStore(
    'class',
    () => {
        const _init = ref<boolean>(false);
        const classList = ref<Vm.Class[]>([]);
        const init = async () => {
            if(_init.value) return;
            classList.value = await ClsAPI.getAll();
            _init.value = false;
        };
        return {_init, init, classList}
    },
    {persist: {enabled: true}}
)