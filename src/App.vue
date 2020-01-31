<template>
  <div id="app">
    <div class="logo left">
      <img v-on:click="goToListPrizes()" width="150" src="./assets/logo.png" />
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
import bus from "./bus.js";

export default {
  name: 'app',
  methods: {
    goToListPrizes() {
      this.$router.push({ name:'ListPrizes' });
      bus.$emit('refreshPrizes');
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
.left {
    text-align: left;
}
.center {
  text-align: center;
}
</style>
