const axios = require("axios");

module.exports = axios.create({
    baseURL: process.env.ONEPIPE_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "api-key": process.env.ONEPIPE_API_KEY,   
        "org-code": process.env.ONEPIPE_ORG_CODE
    }
});
