const axios = require('axios');
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GROQ_API_KEY;
const BASE_URL = 'https://api.groq.com/openai/v1';

async function test() {
  try {
    const res = await axios.post(`${BASE_URL}/chat/completions`, {
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: 'test' }]
    }, {
      headers: { Authorization: `Bearer ${GROK_API_KEY}` }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
test();
