// Identification and contact confirmed by the owner.
export const legalOwner = {
 name: 'Melba Aurora Anias Martínez',
 nif: 'Y7235857W',
 address: 'Calle Cardenal Pla y Deniel, 4, piso 1, 05001 Ávila, España',
 phone: '+34 644 798 063',
 phoneHref: 'tel:+34644798063',
 email: 'masajesaurora@gmail.com',
} as const
export const TERMS_VERSION = '2026-10-12.1'
export const EARLY_SERVICE_SECONDS = 14 * 86400
// Durable copy included in confirmation emails. Update the version whenever
// contractual wording changes, so acceptance records identify these conditions.
export const bookingConditionsText = [
 'CONDICIONES DE RESERVA · Versión '+TERMS_VERSION,
 'Titular: '+legalOwner.name+'. NIF: '+legalOwner.nif+'. Domicilio: '+legalOwner.address+'. Email: '+legalOwner.email+'. Teléfono: '+legalOwner.phone+'.',
 'Servicios de masaje de bienestar, sin asistencia sanitaria, diagnóstico ni tratamiento médico, a domicilio en Ávila capital y exclusivamente para mayores de 18 años. Todos los asistentes deben ser mayores de edad.',
 'Una visita puede combinar masajes de 40 y 60 minutos consecutivos, en una dirección, con un contacto y un pago conjunto. Precios y duración se suman sin descuentos por grupo. El precio contratado es el indicado en esta confirmación, con impuestos incluidos y sin suplemento de desplazamiento dentro de Ávila capital. Las tarifas posteriores no alteran esta reserva.',
 'El pago se realiza en efectivo el día de la cita. La reserva implica pagar el servicio prestado. La agenda ofrece inicios cada diez minutos, exige tres horas de antelación y permite reservar hasta 30 días vista. La visita completa debe caber en la jornada. Horas de Europe/Madrid.',
 'Puedes revisar y corregir los datos antes de confirmar. La reserva se confirma al enviarla si el horario sigue disponible, con una referencia y un enlace privado. Un fallo de email no cancela una reserva confirmada.',
 'Cambios y cancelaciones gratuitos: avisa cuanto antes por teléfono, email o WhatsApp. Los cambios dependen de disponibilidad. No hay penalización por cancelación ni ausencia del cliente. Si Melba cambia o cancela, contactará contigo; puedes aceptar otra fecha o cancelar gratis. Las modificaciones confirmadas se avisan por email.',
 'Desistimiento: en la contratación a distancia puedes desistir durante 14 días naturales desde la contratación, sin indicar el motivo, comunicando una decisión inequívoca a la titular por email, teléfono o correo postal. No es obligatorio utilizar un formulario.',
 'Para citas antes de que terminen esos 14 días, se requiere tu solicitud expresa de comenzar el servicio y reconocimiento de que pierdes el desistimiento al prestarse íntegramente. Puedes cancelar gratis antes de que empiece. Si solicitas detener un servicio iniciado a petición expresa tuya, podrá corresponder el importe proporcional a la parte efectivamente prestada conforme a la normativa.',
 'Modelo opcional: Comunico que desisto de mi reserva [referencia], contratada el [fecha], para el servicio previsto el [fecha]. Nombre y fecha de la comunicación.',
 'Las notas solo sirven para indicaciones logísticas; no incluyas información de salud. Para incidencias, reclamaciones o privacidad usa los datos de la titular. La facturación y contabilidad se gestionan fuera de la web. Se respetan los derechos y la competencia judicial establecidos por la normativa de consumidores.',
].join('\n\n')
export const legalLinks = [
 {to:'/aviso-legal',label:'Aviso legal'},
 {to:'/privacidad',label:'Privacidad'},
 {to:'/cookies',label:'Cookies'},
 {to:'/condiciones-reserva',label:'Condiciones de reserva'},
] as const
