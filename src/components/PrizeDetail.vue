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
                        <b-button v-bind:disabled="prize.quantity <= 0" variant="warning" class="redeem" pill v-on:click="openRedeemModal()">Redeem ></b-button>
                        <hr>
                        <div class="stock">{{ prize.quantity | stockMessage }}</div>
                    </b-card>
                </div>
                <b-modal id="modal-redeem" centered hide-header hide-footer>
                    <div class="center">
                        <h5>Are you sure?</h5>
                        <b-img class="modal-cropped" rounded="circle" :src="prize.image_url" :alt="prize.name"></b-img>
                        <p>Redeem for {{ prize.name }}?</p>
                        <b-button class="modal-btn" variant="warning" pill v-on:click="redeem()">Yes</b-button>
                        <b-button class="modal-btn" variant="secondary" pill v-on:click="$bvModal.hide('modal-redeem')">Cancel</b-button>
                        <b-badge class="pending-login" v-if="showPendingLogin" pill variant="danger">
                            Please <span class="modal-link" v-on:click="openSignupModal()">SIGN UP</span> or <span class="modal-link" v-on:click="openLoginModal()">LOGIN</span> to redeem!
                        </b-badge>
                    </div>
                </b-modal>
                <!-- Could have used shared modals -->
                <b-modal id="modal-redeemed" centered hide-header hide-footer>
                    <div class="center">
                        <h5>Congratulations!</h5>
                        <p>You redeemed {{ prize.name }}.</p>
                        <b-button class="modal-btn" variant="warning" pill v-on:click="goToListPrizes()">More Prizes</b-button>
                    </div>
                </b-modal>
                <b-modal id="modal-out-stock" centered hide-header hide-footer>
                    <div class="center">
                        <h5>Sorry!</h5>
                        <p>We ran out of {{ prize.name }} coupons.</p>
                        <b-button class="modal-btn" variant="warning" pill v-on:click="goToListPrizes()">More Prizes</b-button>
                    </div>
                </b-modal>
                <!-- Could have used shared modals -->
                <b-modal id="modal-session-expired" centered hide-header hide-footer>
                    <div class="center">
                        <h5>Session expired!</h5>
                        <p>Please login again.</p>
                        <b-button class="modal-btn" variant="warning" pill v-on:click="openLoginModal()">Login</b-button>
                        <b-button class="modal-btn" variant="outline-secondary" pill v-on:click="$bvModal.hide('modal-session-expired')">Cancel</b-button>
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
import crypto from "../utils/crypto.js"
import cache from "../utils/cache.js"

export default {
    data() {
        return {
            id: this.$route.params.id,
            prize: null,
            title: 'Details',
            name: 'PrizeDetail',
            user: null,
            showPendingLogin: false
        };
    },
    created() {
        this.createGetUserDataBus();
        axios.get(process.env.VUE_APP_BACKEND_APP + '/prizes/' + this.id)
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
            if(!this.user || !this.user.name || !this.user.token) {
                this.showPendingLogin = true;
            } else {
                const tokenCipher = crypto.encryptObject(this.user.token);
                const headers = {
                    "Authorization" : `Bearer ${ tokenCipher }`,
                    "Content-Type": "application/json"
                };
                axios.patch(process.env.VUE_APP_BACKEND_APP + '/prizes/decrement/' + this.id, {}, { headers })
                    .then(() => {
                        this.prize.quantity--;
                        this.$bvModal.hide('modal-redeem');
                        this.$bvModal.show('modal-redeemed');
                    })
                    .catch(error => {
                        this.$bvModal.hide('modal-redeem');
                        if(error.response.data.error && error.response.data.error.includes('authenticate')) {
                            cache.clean();
                            bus.$emit('getUserDataFromCache');
                            this.$bvModal.show('modal-session-expired');
                        } else {
                            this.$bvModal.show('modal-out-stock');
                        }
                    });
            }
        },
        openRedeemModal() {
            bus.$emit('updateUserData');
            this.showPendingLogin = false;
            this.$bvModal.show('modal-redeem');
        },
        openSignupModal() {
            this.$bvModal.hide('modal-redeem');
            bus.$emit('resetLoginErrorMessage');
            this.$bvModal.show('modal-signup');
        },
        openLoginModal() {
            this.$bvModal.hide('modal-redeem');
            this.$bvModal.hide('modal-session-expired');
            bus.$emit('resetLoginErrorMessage');
            this.$bvModal.show('modal-login');
        },
        createGetUserDataBus() {
            bus.$on("getUserData", (data) => {
                this.user = data;
            });
        }
    },
    filters: {
        stockMessage(value) {
            if(value <= 0) {
                return 'Out of stock';
            } else {
                return value + ' left in stock';
            }
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
.modal-link:hover {
    cursor: pointer;
    text-decoration: underline;
}
</style>
