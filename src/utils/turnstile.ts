type Turnstile={ready:(callback:()=>void)=>void;render:(element:HTMLElement,options:Record<string,unknown>)=>string;remove:(id:string)=>void;reset:(id:string)=>void}
let pending:Promise<Turnstile>|undefined
export function loadTurnstile():Promise<Turnstile>{
 const browser=window as typeof window&{turnstile?:Turnstile}
 if(browser.turnstile)return Promise.resolve(browser.turnstile)
 if(pending)return pending
 pending=new Promise<Turnstile>((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true
  const fail=()=>{clearTimeout(timer);script.remove();pending=undefined;reject(new Error('TURNSTILE_LOAD_FAILED'))}
  const timer=setTimeout(fail,10000)
  script.onerror=fail;script.onload=()=>{if(!browser.turnstile){fail();return}clearTimeout(timer);resolve(browser.turnstile)}
  document.head.append(script)
 });return pending
}
