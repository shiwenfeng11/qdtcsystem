//这里不是总仓库，这里只是把pinia全局性代码收拢在这里
import {createPinia} from "pinia";
//把所有仓库在这里统一导入在统一export 导出
import useAuthStore from './auth';
import useFuncStore from './func';
import useRoleStore from './role';
import useStaffStore from './staff';
//统一导入所有pinia仓库
import piniaPersist from 'pinia-plugin-persist';
import useDashboardStore from './dashboard';
import useClsrStore from './clsr';
import useClassStore from './class';

const pinia = createPinia();
pinia.use(piniaPersist);
export default pinia;
//export统一导出
export {
    useAuthStore,
    useDashboardStore,
    useFuncStore,
    useRoleStore,
    useStaffStore,
    useClsrStore,
    useClassStore
};

