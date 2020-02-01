import CryptoJS from "crypto-js";

export default {
    encryptObject(object) {
        return CryptoJS.AES.encrypt(JSON.stringify(object), process.env.VUE_APP_AES_SECRET).toString();
    },
    decryptCipher(cipher) {
        const bytes = CryptoJS.AES.decrypt(cipher, process.env.VUE_APP_AES_SECRET);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    },
    generateCipherObject(object) {
        return {
            cipher: this.encryptObject(object)
        };
    }
}