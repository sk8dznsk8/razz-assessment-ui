<template>
  <div id="app">
    <div class="container">
      <div class="row">
        <div class="col logo left">
          <img v-on:click="goToListPrizes()" width="150" src="./assets/logo.png" />
        </div>
        <div class="col right greeting-section" v-if="token && name">
          Welcome, {{ name }} <b-button pill variant="outline-secondary" v-on:click="logout()">Logout</b-button>
        </div>
        <div v-else class="col right btn-section">
          <b-button pill variant="outline-secondary" v-on:click="modalErrorMessage = ''" v-b-modal.modal-signup>Sign up</b-button>
          <b-button pill variant="warning" v-on:click="modalErrorMessage = ''" v-b-modal.modal-login>Login</b-button>
          <!-- Could have used shared modals -->
          <b-modal id="modal-signup" centered hide-header hide-footer>
              <div class="center">
                  <h5>Sign up and enjoy!</h5>
                  <b-form-input class="modal-control" v-model="name" placeholder="Enter your name"></b-form-input>
                  <b-form-input class="modal-control" v-model="email" type="email" placeholder="Enter your email"></b-form-input>
                  <b-form-input class="modal-control" v-model="password" type="password" placeholder="Enter your password"></b-form-input>
                  <b-button class="modal-btn" variant="warning" pill v-on:keyup.enter="signup()" v-on:click="signup()">Sign up</b-button>
                  <b-button class="modal-btn" variant="outline-secondary" pill v-on:click="$bvModal.hide('modal-signup')">Cancel</b-button>
                  <div v-if="modalErrorMessage">
                    <b-badge class="pending-login" pill variant="danger">
                      {{ modalErrorMessage }}
                    </b-badge>
                  </div>
              </div>
          </b-modal>
          <b-modal id="modal-login" centered hide-header hide-footer>
              <div class="center">
                  <h5>Welcome back!</h5>
                  <b-form-input class="modal-control" v-model="email" type="email" placeholder="Enter your email"></b-form-input>
                  <b-form-input class="modal-control" v-model="password" type="password" placeholder="Enter your password"></b-form-input>
                  <b-button class="modal-btn" variant="warning" pill v-on:keyup.enter="login()" v-on:click="login()">Log in</b-button>
                  <b-button class="modal-btn" variant="outline-secondary" pill v-on:click="$bvModal.hide('modal-login')">Cancel</b-button>
                  <div v-if="modalErrorMessage">
                    <b-badge class="pending-login" pill variant="danger">
                      {{ modalErrorMessage }}
                    </b-badge>
                  </div>
              </div>
          </b-modal>
          <!-- Could have used shared modals -->
        </div>
      </div>
    </div>
    <div class="header">Rewards</div>
    <router-view />
    <div class="footer">
      <span>Terms & Conditions</span> |
      <span>Privacy Policy</span>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import bus from "./bus.js";
import crypto from "./utils/crypto.js"
import cache from "./utils/cache.js"

export default {
  name: 'app',
  data() {
      return {
          name: '',
          email: '',
          password: '',
          token: '',
          modalErrorMessage: ''
      };
  },
  created: function() {
      this.getUserDataFromCache();
      this.createListenersForBus();
  },
  methods: {
    goToListPrizes() {
      this.$router.push({ name:'ListPrizes' });
      bus.$emit('refreshPrizes');
    },
    signup() {
      const signupObj = {
        name: this.name,
        email: this.email,
        password: this.password
      };
      axios.post(process.env.VUE_APP_BACKEND_APP + '/users/signup', crypto.generateCipherObject(signupObj))
            .then(result => {
              // Decrypt
              const data = crypto.decryptCipher(result.data.cipher);
              // Use decrypted
              this.token = data.token;
              signupObj.token = this.token;
              // Work on cache
              const cipherCache = crypto.encryptObject(signupObj);
              cache.set(cipherCache);
              // Emit changes to other components
              bus.$emit('updateUserData');
            })
            .catch(error => {
              if(error.response.data.handledError) {
                this.modalErrorMessage = error.response.data.handledError;
              } else {
                this.modalErrorMessage = 'Sign up failed!';
              }
            });
    },
    login() {
      const loginObj = {
        email: this.email,
        password: this.password
      };
      axios.post(process.env.VUE_APP_BACKEND_APP + '/users/login', crypto.generateCipherObject(loginObj))
            .then(result => {
              // Decrypt
              const data = crypto.decryptCipher(result.data.cipher);
              // Use decrypted
              this.name = data.user.name;
              this.token = data.token;
              loginObj.name = this.name;
              loginObj.token = this.token;
              // Work on cache
              const cipherCache = crypto.encryptObject(loginObj);
              cache.set(cipherCache);
              // Emit changes to other components
              bus.$emit('updateUserData');
            })
            .catch(error => {
              if(error.response.data.handledError) {
                this.modalErrorMessage = error.response.data.handledError;
              } else {
                this.modalErrorMessage = 'Login failed!';
              }
            });
    },
    logout() {
      const tokenCipher = crypto.encryptObject(this.token);
      const headers = {
        "Authorization" : `Bearer ${ tokenCipher }`,
        "Content-Type": "application/json"
      };
      axios.post(process.env.VUE_APP_BACKEND_APP + '/users/logout', {}, { headers })
            .then(() => {})
            .catch(() => {})
            .finally(() => {
              this.clearUserData();
              cache.clean();
              // Emit changes to other components
              bus.$emit('updateUserData');
            });
    },
    getUserDataFromCache() {
      const cacheCipher = cache.get();
      if(cacheCipher) {
        // Decrypt
        const fromCache = crypto.decryptCipher(cacheCipher);
        // Use decrypted
        this.name = fromCache.name;
        this.email = fromCache.email;
        this.password = fromCache.password;
        this.token = fromCache.token;
      } else {
          this.clearUserData();
      }
      // Emit changes to other components
      bus.$emit('updateUserData');
    },
    clearUserData() {
      this.name = '';
      this.email = '';
      this.password = '';
      this.token = '';
    },
    createListenersForBus() {
      bus.$on("updateUserData", () => {
          bus.$emit("getUserData", {
            name: this.name,
            email: this.email,
            password: this.password,
            token: this.token,
          });
      });
      bus.$on("getUserDataFromCache", () => {
        this.getUserDataFromCache();
      });
      bus.$on("resetLoginErrorMessage", () => {
        this.modalErrorMessage = '';
      });
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap');
#app {
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0px 60px 60px 60px;
}
.logo {
  margin-top: 15px;
  margin-bottom: 15px;
  padding-left: 15px;
  cursor: pointer;
}
.greeting-section {
  margin-top: 30px;
  margin-bottom: 15px;
  padding-left: 15px;
}
.btn-section {
  margin-top: 25px;
  margin-bottom: 15px;
  padding-left: 15px;
}
.header {
  background: #0274BB;
  font-size: 35px;;
  font-weight: bold;
  color: white;
  padding: 60px;
}
.footer {
  background: #1c1c1c;
  padding: 60px;
  color: white;
}
.component-body {
    background: #F3F3F3;
    padding: 60px;
}
.right {
  text-align: right;
}
.left {
    text-align: left;
}
.center {
  text-align: center;
}
.modal-btn {
    font-size: 12px;
    width: 25%;
    margin-right: 10px;
}
.modal-body {
  padding: 45px;
}
.modal-control {
  margin-bottom: 10px;
}
.pending-login {
    margin-top: 10px;
}
</style>
