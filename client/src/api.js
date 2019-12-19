import axios from 'axios';

export const API = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  headers: {
    'Authorization': 'Bearer {token}',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})
