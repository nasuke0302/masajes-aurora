import {dispatch} from '../core/notifications'
import type {AppEnv} from '../core/types'
import {purgeExpiredData} from '../core/retention'
export default defineNitroPlugin(app=>{app.hooks.hook('cloudflare:scheduled',async({env})=>{await purgeExpiredData(env as AppEnv);await dispatch(env as AppEnv)})})

