<template>
    <div class="component-body">
        <div v-if="prize" class="container">
            <div class="row">
                <div class="col-lg-6 col-sm-12">
                    <b-img class="cropped" :src="prize.image_url" fluid :alt="prize.name"></b-img>
                </div>
                <div class="col-lg-6 col-sm-12 left">
                    <b-card :title="prize.name" class="redeem-card">
                        <hr>
                        <b-button variant="warning" class="redeem" pill v-b-modal.modal-redeem>Redeem ></b-button>
                        <hr>
                        <div class="stock">{{ prize.quantity }} left in stock</div>
                    </b-card>
                </div>
                <b-modal id="modal-redeem" centered hide-header hide-footer>
                    <div class="center">
                        <h5>Are you sure?</h5>
                        <b-img class="modal-cropped" rounded="circle" :src="prize.image_url" :alt="prize.name"></b-img>
                        <p>Redeem for {{ prize.name }}?</p>
                        <b-button class="modal-btn" variant="warning" pill v-on:click="redeem()">Yes</b-button>
                        <b-button class="modal-btn" variant="secondary" pill v-on:click="$bvModal.hide('modal-redeem')">Cancel</b-button>
                    </div>
                </b-modal>
                <b-modal id="modal-redeemed" centered hide-header hide-footer>
                    <div class="center">
                        <h5>Congratulations!</h5>
                        <p>You redeemed {{ prize.name }}.</p>
                        <b-button class="modal-btn" variant="warning" pill v-on:click="goToListPrizes()">More Prizes</b-button>
                    </div>
                </b-modal>
            </div>
            <hr>
            <div class="row">
                <div class="col description">Description</div>
                <div class="col-9 left">{{ prize.description }}</div>
            </div>
        </div>
        <p v-else>Prize not loaded!</p>
    </div>
</template>
<script>
import axios from "axios";
import bus from "../bus.js";

export default {
    data() {
        return {
            id: this.$route.params.id,
            prize: null,
            title: 'Details',
            name: 'PrizeDetail',
        };
    },
    created() {
        axios.get('http://localhost:4000/prizes/' + this.id)
            .then(result => {
                this.prize = result.data;
            });
    },
    methods: {
        goToListPrizes() {
            this.$router.push({ name:'ListPrizes' });
            bus.$emit('refreshPrizes');
        },
        redeem() {
            //Mongo operation
            axios.patch('http://localhost:4000/prizes/decrement/' + this.id)
                .then(() => {
                    this.prize.quantity--;
                    this.$bvModal.hide('modal-redeem');
                    this.$bvModal.show('modal-redeemed');
                });
        }
    }
};
</script>
<style scoped>
h4 {
    font-weight: bold;
    margin-bottom: 40px;
}
hr {
    margin-top: 30px;
    margin-bottom: 30px;
}
.cropped {
    width: 400px;
    height: 400px;
    object-fit: cover;
}
.redeem-card {
    max-width: 400px;
}
.modal-cropped {
    width: 200px;
    height: 200px;
    object-fit: cover;
    margin-bottom: 10px;
}
.modal-btn {
    font-size: 12px;
    width: 25%;
    margin-right: 10px;
}
.redeem {
    padding: 10px 60px 10px 60px;
    font-size: 13px;
}
.stock {
    font-size: 10px;
}
.description {
    font-size: 20px;
    font-weight: bold;
}
</style>
