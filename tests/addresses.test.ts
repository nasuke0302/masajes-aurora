import {describe,it,expect,vi} from 'vitest'
import {normalizeAddress,searchAddresses,validatedAddress} from '../server/core/addresses'
const portal={id:'07.05.G05_050190111614',type:'portal',noNumber:false,muniCode:'05019',poblacion:'Ávila',tip_via:'CALLE',address:'SAN SEGUNDO',portalNumber:2,lat:40.6547,lng:-4.6968}
describe('verified Ávila addresses',()=>{
 it('normalizes an official urban portal',()=>expect(normalizeAddress(portal)).toEqual({id:portal.id,portal:'2',street:'CALLE SAN SEGUNDO 2',label:'CALLE SAN SEGUNDO 2, Ávila'}))
 it('avoids duplicating street type or portal in autocomplete labels',()=>expect(normalizeAddress({...portal,address:'CALLE SAN SEGUNDO 2, Ávila'})?.street).toBe('CALLE SAN SEGUNDO 2'))
 it.each([{poblacion:'Vicolozano'},{poblacion:'Brieva'},{poblacion:''},{muniCode:'05020'},{type:'callejero'},{noNumber:true},{portalNumber:null},{lat:null}])('rejects non-urban or incomplete result %j',change=>expect(normalizeAddress({...portal,...change})).toBeNull())
 it('filters external localities from search results',async()=>{const mock=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify([portal,{...portal,id:'other',poblacion:'Vicolozano'}])));try{expect(await searchAddresses('San Segundo 2')).toHaveLength(1)}finally{mock.mockRestore()}})
 it('requeries the provider and ignores client address and coordinates',async()=>{const mock=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify(portal)));try{expect(await validatedAddress({addressSelection:{id:portal.id,portal:'2'},addressExtra:'3º B',address:'Outside the city',lat:0,lng:0})).toBe('CALLE SAN SEGUNDO 2, 3º B');expect(String(mock.mock.calls[0]![0])).toContain('find?')}finally{mock.mockRestore()}})
 it('rejects a portal mismatch on lookup',async()=>{const mock=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify({...portal,portalNumber:3})));try{await expect(validatedAddress({addressSelection:{id:portal.id,portal:'2'}})).rejects.toThrow()}finally{mock.mockRestore()}})
 it('rejects free text with no selected official portal',async()=>{const mock=vi.spyOn(globalThis,'fetch');try{await expect(validatedAddress({address:'Calle San Segundo 2'})).rejects.toThrow();expect(mock).not.toHaveBeenCalled()}finally{mock.mockRestore()}})
 it('fails closed on provider timeout',async()=>{const mock=vi.spyOn(globalThis,'fetch').mockRejectedValue(new Error('timeout'));try{await expect(validatedAddress({addressSelection:{id:portal.id,portal:'2'}})).rejects.toThrow('No se puede comprobar')}finally{mock.mockRestore()}})
})
