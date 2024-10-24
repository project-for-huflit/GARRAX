// require('dotenv').config();

// const express = require('express'); 

const API_BASE_URL = "http://localhost:5001";

const API_ROUTES = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  VERIFY:`${API_BASE_URL}/auth/verify`,
};

export default API_ROUTES;