<template>
    <v-container>
        <v-layout row wrap v-for="item in meetups" :key="item.id">
            <v-flex xs12 sm10 md8 offset-sm1 offset-md2>
                <v-card>
                    <v-container fluid>
                        <v-layout row>
                            <v-flex xs5 sm4 md3>
                                <v-card-media :src="item.imgUrl"
                                height="130px">
                                </v-card-media>
                            </v-flex>
                            <v-flex xs7 sm8 md9>
                                <v-card-title primary-title>
                                    <div>
                                        <h5 class="darken-1 teal--text mb0">{{item.title}}</h5>
                                        <div>{{ item.date | f-date}}</div>
                                    </div>
                                </v-card-title>
                                <v-card-actions>
                                    <v-btn class="darken-1 teal white--text" :to="'/meetups/' + item.id">
                                        <v-icon dark left>arrow_forward</v-icon>
                                        View meetup
                                    </v-btn>
                                </v-card-actions>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<<script>
export default {
  computed: {
    meetups () {
      return this.$store.getters.loadedMeetups
    }
  }
}
</script>

