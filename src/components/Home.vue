<template>
    <v-container>
        <v-layout>
            <v-flex xs12 class="text-xs-center">
                <v-progress-circular indeterminate class="teal--text" :width="7" :size="70" v-if="loading" ></v-progress-circular>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<<script>
export default {
  computed: {
    loading () {
      return this.$store.getters.loading
    }
  }
}
</script>
