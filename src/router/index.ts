import Vue from 'vue'
import VueRouter, { type NavigationGuardNext, type Route, type RouteConfig } from 'vue-router'

// Views
import Dashboard from '@/views/Dashboard.vue'
import Console from '@/views/Console.vue'
import GcodePreview from '@/views/GcodePreview.vue'
import Jobs from '@/views/Jobs.vue'
import Tune from '@/views/Tune.vue'
import Diagnostics from '@/views/Diagnostics.vue'
import History from '@/views/History.vue'
import Timelapse from '@/views/Timelapse.vue'
import Configure from '@/views/Configure.vue'
import System from '@/views/System.vue'
import Settings from '@/views/Settings.vue'
import AppSettingsNav from '@/components/layout/AppSettingsNav.vue'
import MacroCategorySettings from '@/components/settings/macros/MacroCategorySettings.vue'
import FullscreenCamera from '@/views/FullscreenCamera.vue'
import NotFound from '@/views/NotFound.vue'
import Login from '@/views/Login.vue'
import Icons from '@/views/Icons.vue'


import { appInit } from '../init'
import type { InitConfig } from '../store/config/types'
import { Router } from 'workbox-routing'


Vue.use(VueRouter)

//B
const ifAuthenticated = (to: Route, from: Route, next: NavigationGuardNext<Vue>) => {
  if (
    router.app.$store.getters['auth/getAuthenticated'] ||
    !router.app.$store.state.socket.apiConnected
  ) {
    if(to.query.url !=null){
      router.app.$socket.close()

      const url = to.query.url as string;

      const apiConfig = Vue.$filters.getApiUrls(url + '.aws.qidi3dprinter.com:7680')

      appInit(apiConfig, router.app.$store.state.config.hostConfig)
      .then((config: InitConfig) => {
        if (config.apiConfig.socketUrl && config.apiConnected && config.apiAuthenticated) {
          Vue.$socket.connect(config.apiConfig.socketUrl)
        }
      })
    }
    if(to.query.theme!= null){
      if(to.query.theme == "light"){
        router.app.$store.dispatch('config/updateTheme', {
          isDark: false
        })
      }else if(to.query.theme == "dark"){
        router.app.$store.dispatch('config/updateTheme', {
          isDark: true
        })
      }
    }
    next()
  } else {
    next('/login')
  }
}

// http://api2_test.qidi3dprinter.com/#/?url=nt02qvpzmqujcvpsmr.aliyun.qidi3dprinter.com
// http://nt02qvpzmqujcvpsmr.aliyun.qidi3dprinter.com:7680
// http://a4hh223b8ll6uhrnnk.aliyun.qidi3dprinter.com:7680
const defaultRouteConfig: Partial<RouteConfig> = {
  beforeEnter: ifAuthenticated,
  meta: {
    fileDropRoot: 'gcodes'
  }
}

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    ...defaultRouteConfig
  },
  {
    path: '/console',
    name: 'Console',
    component: Console,
    ...defaultRouteConfig
  },
  {
    path: '/jobs',
    name: 'Jobs',
    component: Jobs,
    ...defaultRouteConfig
  },
  {
    path: '/tune',
    name: 'Tune',
    component: Tune,
    ...defaultRouteConfig
  },
  {
    path: '/diagnostics',
    name: 'Diagnostics',
    component: Diagnostics,
    ...defaultRouteConfig
  },
  {
    path: '/timelapse',
    name: 'Timelapse',
    component: Timelapse,
    ...defaultRouteConfig,
    meta: {
      fileDropRoot: 'timelapse'
    }
  },
  {
    path: '/history',
    name: 'History',
    component: History,
    ...defaultRouteConfig
  },
  {
    path: '/system',
    name: 'System',
    component: System,
    ...defaultRouteConfig
  },
  {
    path: '/configure',
    name: 'Configuration',
    component: Configure,
    ...defaultRouteConfig,
    meta: {}
  },
  {
    path: '/settings',
    name: 'Settings',
    ...defaultRouteConfig,
    meta: {
      hasSubNavigation: true
    },
    components: {
      default: Settings,
      navigation: AppSettingsNav
    },
    children: [
      {
        path: '/settings/macros/:categoryId',
        name: 'Macros',
        meta: {
          hasSubNavigation: true
        },
        components: {
          default: MacroCategorySettings,
          navigation: AppSettingsNav
        }
      }
    ]
  },
  {
    path: '/camera/:cameraId',
    name: 'Camera',
    component: FullscreenCamera,
    ...defaultRouteConfig
  },
  {
    path: '/preview',
    name: 'Gcode Preview',
    component: GcodePreview,
    ...defaultRouteConfig
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      fillHeight: true
    }
  },
  {
    path: '/icons',
    name: 'Icons',
    component: Icons
  },
  {
    path: '*',
    name: '404',
    component: NotFound
  }
]

const router = new VueRouter({
  base: import.meta.env.BASE_URL,
  routes,
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return {
        selector: to.hash,
        offset: { x: 0, y: 60 },
        behavior: 'smooth'
      }
    }
    return { x: 0, y: 0 }
  }
})

router.beforeEach((to, from, next) => {
  router.app?.$store.commit('config/setContainerColumnCount', 2)
  next()
})

declare module 'vue-router' {
  interface RouteMeta {
    fillHeight?: boolean
    hasSubNavigation?: boolean
    fileDropRoot?: string
  }
}

export default router
