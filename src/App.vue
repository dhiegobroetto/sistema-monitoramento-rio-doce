<template>
  <v-app class="main">
    <v-app-bar
      app
      color="primary"
      dark
    >
      Sistema de Monitoramento do Rio Doce
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({}),
};
</script>

<style lang="scss" scoped>
.main {
  background: #F5F5F5 !important;
}
</style>