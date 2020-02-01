export default {
    clean() {
        localStorage.removeItem(process.env.VUE_APP_CACHE_ID);
    },
    get() {
        return localStorage.getItem(process.env.VUE_APP_CACHE_ID);
    },
    set(value) {
        this.clean();
        localStorage.setItem(process.env.VUE_APP_CACHE_ID, value);
    }
}