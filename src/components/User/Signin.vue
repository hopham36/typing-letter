<template>
    <v-container>
        <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
                <h4>Sign In</h4>
            </v-flex>
        </v-layout>
         <v-layout row v-if="error">
            <v-flex xs12 sm6 offset-sm3>
                <c-alert @closeError="onCloseError" :text="error != null ? error.message : ''"></c-alert>
            </v-flex>
        </v-layout>
        <v-layout row>
            <v-flex xs12>
                <form @submit.prevent="onSignUserIn">
                    <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <v-text-field name="email" v-model="email" label="Email" required type="email"></v-text-field>
                        </v-flex>
                    </v-layout>
                    <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <v-text-field name="password" v-model="password" label="Password" required type="password"></v-text-field>
                        </v-flex>
                    </v-layout>
                    <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <v-btn light raised class="teal darken-1" type="submit" :loading="loading"
                              :disabled="loading">Sign in</v-btn>
                        </v-flex>
                    </v-layout>
                </form>
            </v-flex>
        </v-layout>
    </v-container>
</template>
<<script>
export default {
  data () {
    return {
      email: '',
      password: ''
    }
  },
  computed: {
    user () {
      return this.$store.getters.user
    },
    error () {
      return this.$store.getters.error
    },
    loading () {
      return this.$store.getters.loading
    }
  },
  watch: {
    user (value) {
      if (value !== null && value !== undefined) {
        this.$router.push('/')
      }
    }
  },
  methods: {
    onSignUserIn () {
      this.$store.dispatch('signUserIn', {email: this.email, password: this.password})
    },
    onCloseError () {
      this.$store.dispatch('clearError')
    }
  }
}
</script>
