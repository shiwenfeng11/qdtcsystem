import {createRouter,createWebHashHistory} from 'vue-router';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {path:"/", redirect: "/login"},
        {
            path: "/home",
            component: () => import("../views/EduHome.vue"),
            children: [
                {path: 'func',components:{func: () => import('../views/EduFunc.vue')} },
                {path: 'rolefunc',components: {rolefunc: () => import('../views/EduRoleFunc.vue')}},
                {path: 'userrole',components: {userrole: () => import('../views/EduUserRole.vue')}},
                {path: 'classroom',components: {classroom: () => import('../views/EduClassroom.vue')}},
                {path: 'class',components: {class:() => import('../views/EduClass.vue')}},
                {path: 'student',components: {student: () => import('../views/EduStudent.vue')}},
                {path: 'staff',components: {staff: () => import('../views/EduStaff.vue')}},
                {path: 'password',components: {password: () => import('../views/EduPassword.vue')}}
            ]
    },
        {path: "/login", component: () => import("../views/EduLogin.vue")},
    ]
})
export default router;