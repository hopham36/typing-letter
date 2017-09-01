<template>
    <v-container>
        <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
                <h4>Create a new Meetup</h4>
            </v-flex>
        </v-layout>
        <v-layout row>
            <v-flex xs12>
                <form @submit.prevent="onCreateMeetup">
                    <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <v-text-field name="title" v-model="title" label="Title" required></v-text-field>
                        </v-flex>
                    </v-layout>
                     <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <v-text-field name="location" v-model="location" label="Location" required></v-text-field>
                        </v-flex>
                    </v-layout>
                     <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <v-text-field name="imgUrl" v-model="imgUrl" label="Image url" required></v-text-field>
                        </v-flex>
                    </v-layout>
                    <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <img :src="imgUrl" height="200" >
                        </v-flex>
                    </v-layout>
                    <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <v-text-field required lable="Date" readonly v-model="formattedDate"></v-text-field>
                            <v-date-picker name="date" v-model="date" 
                            :date-format="d => new Date(d).toDateString()" no-title></v-date-picker>
                             <v-time-picker format="24hr" v-model="time"></v-time-picker>
                        </v-flex>
                    </v-layout>
                    <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <v-text-field name="description" v-model="description" label="Description" rows="4" multi-line required></v-text-field>
                        </v-flex>
                    </v-layout>
                    <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <v-btn light raised class="teal darken-1" type="submit" :disabled="!formIsValid || loading" :loading="loading">Create Meetup</v-btn>
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
      title: '',
      description: '',
      imgUrl: '',
      location: '',
      date: new Date(),
      time: new Date()
    }
  },
  computed: {
    formIsValid () {
      return this.title !== '' && this.description !== '' && this.imgUrl !== '' && this.location !== '' && this.date !== ''
    },
    formattedDate () {
      const date = new Date(this.date)
      if (typeof this.time === 'string') {
        const hours = this.time.match(/^(\d+)/)[1]
        const minutes = this.time.match(/:(\d+)/)[1]
        date.setHours(hours)
        date.setMinutes(minutes)
      } else {
        date.setHours(this.time.getHours())
        date.setMinutes(this.time.getMinutes())
      }
      return date
    },
    loading () {
      return this.$store.getters.loading
    }
  },
  methods: {
    onCreateMeetup () {
      if (!this.formIsValid) {
        return
      }
      const model = {
        title: this.title,
        location: this.location,
        imgUrl: this.imgUrl,
        description: this.description,
        date: this.formattedDate
      }
      this.$store.dispatch('createMeetup', model).then(res => {
        this.$router.push('/meetups/' + res.id)
      })
    }
  }
}
</script>
