import {createRemoteJWKSet,jwtVerify,type JWTVerifyGetKey} from 'jose'
export type AccessEnv={ACCESS_TEAM_DOMAIN:string;ACCESS_AUD:string;ACCESS_EMAIL:string;LOCAL_DEV:string;ACCESS_MODE?:string}
const keysets=new Map<string,ReturnType<typeof createRemoteJWKSet>>()
export async function verifyAccessToken(token:string,env:AccessEnv,keys?:JWTVerifyGetKey){
 if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_TEAM_DOMAIN)||!env.ACCESS_AUD||!env.ACCESS_EMAIL)throw new Error('ACCESS_NOT_CONFIGURED')
 const issuer='https://'+env.ACCESS_TEAM_DOMAIN
 if(!keys){let cached=keysets.get(issuer);if(!cached){cached=createRemoteJWKSet(new URL(issuer+'/cdn-cgi/access/certs'),{timeoutDuration:5000});keysets.set(issuer,cached)}keys=cached}
 const {payload}=await jwtVerify(token,keys,{issuer,audience:env.ACCESS_AUD,algorithms:['RS256'],requiredClaims:['exp','iat','sub','email']})
 if(typeof payload.email!=='string'||payload.email.toLowerCase()!==env.ACCESS_EMAIL.toLowerCase())throw new Error('ACCESS_EMAIL_DENIED')
 return payload.email
}
export async function authorizeAccess(request:Request,env:AccessEnv){
 if(env.ACCESS_MODE==='disabled'&&!env.ACCESS_AUD)return
 if(env.LOCAL_DEV==='true'&&['localhost','127.0.0.1','[::1]'].includes(new URL(request.url).hostname))return
 const token=request.headers.get('Cf-Access-Jwt-Assertion')
 if(!token)throw new Error('ACCESS_REQUIRED')
 return verifyAccessToken(token,env)
}
