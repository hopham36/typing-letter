<template>
  <v-layout row justify-center>
    <v-dialog persistent :value="vdialog">
      <v-card>
        <v-card-text>{{ text }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="green--text darken-1" flat="flat" @click="closeDialog">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<<script>
export default {
  props: ['text', 'vdialog'],
  methods: {
    closeDialog () {
      this.$emit('closeDialog')
    }
  }
}
</script>
