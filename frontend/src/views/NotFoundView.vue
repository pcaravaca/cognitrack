<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title class="text-h5">404 - Page Not Found</v-card-title>
          <v-card-text>
            The page you are looking for does not exist.
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" to="/">Go to Home</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'NotFoundView'
}
</script>
