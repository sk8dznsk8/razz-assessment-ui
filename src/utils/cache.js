export default {
    clean() {
        localStorage.removeItem(process.env.VUE_APP_CACHE_ID);
    },
    get() {
        localStorage.getItem(process.env.VUE_APP_CACHE_ID);
    },
    set(value) {
        this.cleanCache();
        localStorage.setItem(process.env.VUE_APP_CACHE_ID, value);
    }
}