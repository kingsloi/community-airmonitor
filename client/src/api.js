import axios from 'axios';

export const API = axios.create({
  // baseURL: `http://localhost:8080/`,
  headers: {
    Authorization: 'Bearer {token}',
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})
