<script setup lang="ts">
import { legalOwner, TERMS_VERSION } from '#shared/legal'
import { marketingPrice, marketingFirstSessionPrice, marketingFacialPrice, marketingCombinedPrice, marketingFirstCombinedPrice } from '#shared/marketing-offer'
useSeoMeta({ title: 'Condiciones de reserva · Aurora Masajista', description: 'Precios, pago en efectivo, cambios, cancelaciones y desistimiento de las reservas de Aurora Masajista.' })
</script>
<template>
  <LegalPage title="Condiciones de reserva"
    description="Las condiciones que se aplican al contratar tu visita con Aurora Masajista.">
    <p>Versión {{ TERMS_VERSION }}. El servicio lo presta {{ legalOwner.name }}, NIF {{ legalOwner.nif }}, con domicilio
      en {{ legalOwner.address }}. Contacto: <a :href="'mailto:' + legalOwner.email">{{ legalOwner.email }}</a> y <a
        :href="legalOwner.phoneHref">{{ legalOwner.phone }}</a>.</p>
    <h2>El servicio</h2>
    <p>Ofrecemos masajes de bienestar a domicilio exclusivamente en Ávila capital y para personas mayores de 18 años. No
      son servicios sanitarios, diagnósticos ni tratamientos médicos. No se admiten reservas para menores.</p>
    <p>Puedes combinar masajes de 60 minutos para distintas personas adultas en una misma visita. Se realizan
      consecutivamente, en una única dirección, con un contacto y un pago conjunto. La primera sesión de cada persona
      tiene el mismo precio de bienvenida aunque la reserva sea de grupo.</p>
    <h2>Precio y pago</h2>
    <p>La sesión de 60 minutos cuesta {{ marketingPrice }}. La primera sesión de cada persona cuesta {{ marketingFirstSessionPrice }}.
      El facial opcional añade 10 minutos por {{ marketingFacialPrice }}, sin descuento. Con facial, el total es
      {{ marketingCombinedPrice }}, o {{ marketingFirstCombinedPrice }} en la primera sesión.</p>
    <p>
      El pago se acuerda entre la persona interesada y Aurora Masajista antes de confirmar la reserva de una sesión de
      masajes. Se paga en efectivo el día de la cita. La reserva implica la obligación de pagar el servicio
      prestado, aunque no se cobre al reservar. Los cambios posteriores de tarifa no alteran una reserva ya confirmada.
    </p>
    <h2>Cómo reservar</h2>
    <p>Puedes reservar desde la web o contactar con Aurora por WhatsApp o teléfono para acordar fecha y hora.
      Facilita tus datos de contacto y una dirección válida de Ávila capital. Todas las personas que recibirán un masaje
      deben ser mayores de edad.</p>
    <h2>Cambios, cancelaciones y ausencias</h2>
    <p>Puedes cancelar o pedir un cambio de fecha gratuitamente, avisando cuanto antes por teléfono, WhatsApp o email,
      con un mínimo de 3 horas de anterioridad. Los cambios dependen de la disponibilidad. No hay penalización por
      cancelación ni por ausencia del cliente. Si Aurora necesita modificar o cancelar la cita, se pondrá en contacto
      contigo; puedes aceptar otra fecha o cancelar gratuitamente.</p>
    <p>Las modificaciones confirmadas se comunican por WhatsApp o llamada de teléfono.</p>
    <h2>Derecho de desistimiento</h2>
    <p>Cuando contratas a distancia puedes desistir sin indicar el motivo durante los 14 días naturales siguientes a la
      contratación. Para hacerlo, comunica tu decisión a {{ legalOwner.name }} por email, teléfono o correo postal a los
      datos anteriores. Basta una declaración inequívoca; no es obligatorio utilizar un modelo.</p>
    <p>Si la cita se celebra antes de terminar esos 14 días, te pediremos que solicites expresamente iniciar el servicio
      en ese plazo y que reconozcas que perderás el derecho de desistimiento cuando el servicio se haya prestado
      íntegramente. La casilla correspondiente no viene marcada. Mientras no empiece la sesión, mantenemos la
      cancelación gratuita. Si solicitas detener un servicio que ya ha comenzado a petición expresa tuya, podrá
      corresponder el importe proporcional a la parte efectivamente prestada conforme a la normativa aplicable.</p>
    <p>Puedes escribir: «Comunico que desisto de mi reserva [referencia], contratada el [fecha], para el servicio
      previsto el [fecha]. Nombre y fecha de la comunicación». Esta política no limita tus demás derechos como
      consumidor.</p>
    <h2>Notas y privacidad</h2>
    <p>Al acordar tu cita por WhatsApp o llamada telefónica, facilita solo los datos necesarios para organizar la visita
      y las indicaciones logísticas de acceso al domicilio. No compartas enfermedades, lesiones, medicación ni otra
      información de salud por estos canales. Consulta la <NuxtLink to="/privacidad">política
        de privacidad</NuxtLink> para conocer el uso y conservación de tus datos.</p>
    <h2>Consultas y reclamaciones</h2>
    <p>Puedes contactar con la titular mediante el email, teléfono o domicilio indicados. La facturación y la
      documentación contable se gestionan fuera de esta web. Conserva la confirmación de tu reserva. La resolución de
      controversias respetará los derechos y la competencia judicial que establece la normativa de consumidores.</p>
  </LegalPage>
</template>
