import {defineStore} from 'pinia';
import {ref} from 'vue';
import {ClsrAPI} from '@/api';

export default defineStore(
    'clsr',
    () => {
        const _init = ref<boolean>(false);
        const clsrList = ref<Vm.Classroom[]>([]);
        const init = async () => {
                if(_init.value) return;
                clsrList.value = await ClsrAPI.getAll();
                _init.value = false;
        }
        return {init, _init, clsrList};
    },
    {persist: {enabled: true}}
)