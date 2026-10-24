<script setup lang="ts">
import { legalOwner } from '#shared/legal'
useSeoMeta({ title: 'Aviso legal · Aurora Masajista', description: 'Identificación de la titular y datos de contacto de Aurora Masajista.' })
</script>
<template>
  <LegalPage title="Aviso legal" description="Titularidad de la web y datos de contacto de Aurora Masajista.">
    <h2>Titular de la actividad</h2>
    <p>Aurora Masajista es el nombre comercial con el que {{ legalOwner.name }} presta servicios de masaje de bienestar
      a domicilio en Ávila capital, como trabajadora autónoma y en su propio nombre.</p>
    <dl>
      <dt>Nombre</dt>
      <dd>{{ legalOwner.name }}</dd>
      <dt>NIF</dt>
      <dd>{{ legalOwner.nif }}</dd>
      <dt>Domicilio</dt>
      <dd>{{ legalOwner.address }}</dd>
      <dt>Email</dt>
      <dd><a :href="'mailto:' + legalOwner.email">{{ legalOwner.email }}</a></dd>
      <dt>Teléfono</dt>
      <dd><a :href="legalOwner.phoneHref">{{ legalOwner.phone }}</a></dd>
    </dl>
    <h2>Servicios y contacto</h2>
    <p>Los servicios ofrecidos son masajes de bienestar para personas mayores de 18 años. No constituyen asistencia
      sanitaria, diagnóstico ni tratamiento médico. <strong>No se ofrecen servicios de masajes de carácter erótico o
        sexual.</strong></p>
    <p>Puedes utilizar el email o el teléfono indicados para consultas sobre los servicios, cambios y cancelaciones de
      reservas, reclamaciones y solicitudes relativas a tus datos personales.</p>
    <h2>Uso de la web</h2>
    <p>La web permite consultar los servicios y solicitar reservas. Utilízala de forma lícita y facilita datos correctos
      cuando hagas una reserva. La información de bienestar publicada no sustituye el consejo de un profesional
      sanitario.</p>
    <h2>Contenidos y enlaces</h2>
    <p>Los contenidos de esta web están sujetos a los derechos de sus titulares. Su uso debe respetar las autorizaciones
      y excepciones previstas en la legislación aplicable.</p>
    <p>La web incluye enlaces a servicios externos, como WhatsApp. Al abrirlos, accedes a servicios que aplican sus
      propias condiciones y políticas de privacidad.</p>
    <h2>Reclamaciones</h2>
    <p>Para comunicar una incidencia o presentar una reclamación, contacta con {{ legalOwner.name }} mediante el email,
      teléfono o domicilio indicados. Esto no limita los derechos que te reconoce la normativa de consumidores.</p>
  </LegalPage>
</template>
