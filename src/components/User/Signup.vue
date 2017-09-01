<template>
    <v-container>
        <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
                <h4>Sign Up</h4>
            </v-flex>
        </v-layout>
        <v-layout row v-if="error">
            <v-flex xs12 sm6 offset-sm3>
                <c-alert @closeError="onCloseError" :text="error.message"></c-alert>
            </v-flex>
        </v-layout>
        <v-layout row>
            <v-flex xs12>
                <form @submit.prevent="onSignUserUp">
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
                            <v-text-field name="confirmPassword" v-model="confirmPassword" :rules="[rules.passwordMatch]" label="Confirm password" type="password"></v-text-field>
                        </v-flex>
                    </v-layout>
                    <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <v-btn light raised class="teal darken-1" type="submit" :loading="loading"
                              :disabled="loading">Sign up</v-btn>
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
      password: '',
      confirmPassword: '',
      rules: {
        passwordMatch: (value) => {
          return this.password === this.confirmPassword ? true : 'Password do not match'
        }
      }
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
    onSignUserUp () {
      if (this.password === this.confirmPassword) {
        this.$store.dispatch('signUserUp', {email: this.email, password: this.password})
      } else {
        return
      }
    },
    onCloseError () {
      this.$store.dispatch('clearError')
    }
  }
}
</script>
