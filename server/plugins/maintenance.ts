import {dispatch} from '../core/notifications'
import type {AppEnv} from '../core/types'
export default defineNitroPlugin(app=>{app.hooks.hook('cloudflare:scheduled',async({env})=>{await dispatch(env as AppEnv)})})

