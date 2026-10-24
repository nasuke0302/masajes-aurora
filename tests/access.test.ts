import {beforeAll,describe,it,expect} from 'vitest'
import {generateKeyPair,exportJWK,createLocalJWKSet,SignJWT} from 'jose'
import {verifyAccessToken,authorizeAccess,type AccessEnv} from '../workers/access'
import {requireAdmin} from '../server/core/admin'
const env:AccessEnv={ACCESS_TEAM_DOMAIN:'geonuvia.cloudflareaccess.com',ACCESS_AUD:'aurora-audience',ACCESS_EMAIL:'albertoesquivelanias@gmail.com',LOCAL_DEV:'false'}
let privateKey:CryptoKey,keys:ReturnType<typeof createLocalJWKSet>
beforeAll(async()=>{const pair=await generateKeyPair('RS256');privateKey=pair.privateKey;keys=createLocalJWKSet({keys:[{...await exportJWK(pair.publicKey),kid:'test',alg:'RS256'}]})})
async function signed(overrides:Record<string,unknown>={}){return new SignJWT({email:env.ACCESS_EMAIL,iss:'https://'+env.ACCESS_TEAM_DOMAIN,aud:env.ACCESS_AUD,sub:'owner',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600,...overrides}).setProtectedHeader({alg:'RS256',kid:'test'}).sign(privateKey)}
describe('Cloudflare Access authorization',()=>{
 it('serves production publicly only when Access is explicitly disabled',async()=>{
  const production={...env,ACCESS_MODE:'disabled',ACCESS_AUD:'',ACCESS_TEAM_DOMAIN:'',ACCESS_EMAIL:''}
  await expect(authorizeAccess(new Request('https://auroramasajista.com/'),production)).resolves.toBeUndefined()
  await expect(authorizeAccess(new Request('https://auroramasajista.com/'),{...production,ACCESS_MODE:undefined})).rejects.toThrow()
  await expect(authorizeAccess(new Request('https://auroramasajista.com/'),{...env,ACCESS_MODE:'disabled'})).rejects.toThrow()
 })
 it('keeps the production admin protected without Access',async()=>{
  await expect(requireAdmin({node:{req:{headers:{}}}} as never,{...env,ACCESS_AUD:''} as never)).rejects.toThrow('enlace enviado')
 })
 it('accepts signed owner identity with correct audience',async()=>expect(await verifyAccessToken(await signed(),env,keys)).toBe(env.ACCESS_EMAIL))
 it.each([{email:'other@example.com'},{aud:'geonuvia-audience'},{iss:'https://other.cloudflareaccess.com'},{exp:1},{email:undefined},{sub:undefined}])('rejects invalid claims %j',async claims=>{await expect(verifyAccessToken(await signed(claims),env,keys)).rejects.toThrow()})
 it('rejects a forged signature',async()=>{const forged=(await signed()).split('.');forged[2]='A'.repeat(forged[2].length);await expect(verifyAccessToken(forged.join('.'),env,keys)).rejects.toThrow()})
 it('requires authentication even on localhost when deployed',async()=>{await expect(authorizeAccess(new Request('http://localhost/'),env)).rejects.toThrow()})
 it('limits local bypass to explicitly enabled loopback hosts',async()=>{const local={...env,LOCAL_DEV:'true'};await expect(authorizeAccess(new Request('http://localhost/'),local)).resolves.toBeUndefined();await expect(authorizeAccess(new Request('https://untrusted.example/'),local)).rejects.toThrow()})
 it('does not accept an old admin cookie when Access is enabled',async()=>{await expect(requireAdmin({node:{req:{headers:{cookie:'aurora_admin='+ 'a'.repeat(64)}}}} as never,env as never)).rejects.toThrow('Cloudflare Access')})
})
