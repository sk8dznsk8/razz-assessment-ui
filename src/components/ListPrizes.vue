<template>
    <div class="component-body">
        <h5>Here is the full list of prizes that you can win.</h5>
        <div v-if="prizes.length > 0">
            <div class="prize" v-for="(prize, index) in prizes" :key="index">
                <b-card
                    :title="prize.name"
                    :img-src="prize.image_url"
                    :img-alt="prize.name"
                    img-top
                    tag="article"
                    style="max-width: 20rem;"
                    class="mb-2"
                >
                    <b-button pill variant="warning" v-on:click="openPrizeDetails(prize)">
                        <span class="redeem">Redeem ></span>
                    </b-button>
                </b-card>
            </div>
        </div>
        <p v-else>No prizes to show!</p>
    </div>
</template>
<script>
import axios from "axios";
import bus from "../bus.js";

export default {
    data() {
        return {
            name: 'ListPrizes',
            prizes: [],
            doneLoading: false
        };
    },
    created: function() {
        this.getPrizes();
        this.busRefreshPrizes();
    },
    methods: {
        async getPrizes() {
            this.prizes =  (await axios.get(process.env.VUE_APP_BACKEND_APP + '/prizes')).data;
        },
        openPrizeDetails(prize) {
            this.$router.push({ name:'PrizeDetail', params: { id: prize._id } });
            bus.$emit('getPrizeDetail', prize);
        },
        busRefreshPrizes() {
            bus.$once("refreshPrizes", () => {
                console.log('Received emit');
                this.getPrizes();
            });
        }
    }
};
</script>
<style scoped>
h5 {
    margin-bottom: 30px;
}
h4 {
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 20px;
}
.prize {
  display: inline-block;
  margin: 10px;
}
.redeem {
    padding-left: 15px;
    padding-right: 15px;
    font-size: 12px;
}
</style>