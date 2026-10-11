export function apiError(error:unknown){const e=error as {data?:{statusMessage?:string};message?:string};return e.data?.statusMessage||'No se ha podido completar la solicitud. Inténtalo de nuevo.'}

