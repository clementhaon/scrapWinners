const { createClient } = require("redis");
const redis_url = process.env.REDIS_URL || '';
const redis_password = process.env.REDIS_PASSWORD || '';

const client = createClient({url:redis_url + ':6379', password: redis_password});

const getRedisJsonAsync = async (key) => {
    try {
        await client.connect();
        const data = await client.json.get(key);
        await client.quit();
        return data;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const setRedisJsonAsync = async (key, data) => {
    try {
        await client.connect();
        await client.json.set(key, '.', data);
        await client.quit();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = { getRedisJsonAsync, setRedisJsonAsync };