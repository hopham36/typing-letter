<template>
    <v-alert error dismissible @input="closeError" value="true">
      {{ text }}
    </v-alert>
</template>
<<script>
export default {
  props: ['text'],
  methods: {
    closeError () {
      this.$emit('closeError')
    }
  }
}
</script>
