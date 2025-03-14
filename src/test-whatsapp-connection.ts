import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

async function testWhatsAppAPI() {
  const url = `https://graph.facebook.com/${process.env.WHATSAPP_CLOUD_API_VERSION}/${process.env.WHATSAPP_CLOUD_API_PHONE_NUMBER_ID}`;
  
  const config = {
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_CLOUD_API_ACCESS_TOKEN}`,
    },
  };

  try {
    const response = await axios.get(url, config);
    console.log('API Test Successful:', response.data);
    return true;
  } catch (error) {
    console.error('API Test Failed:', error.response?.data || error.message);
    return false;
  }
}

testWhatsAppAPI();