<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
/* Asegura que el fondo sea visible */
html, body, #app {
  background-color: #121212 !important;
  color: white !important;
}
</style>
