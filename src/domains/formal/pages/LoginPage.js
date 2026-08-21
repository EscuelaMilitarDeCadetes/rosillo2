// src/domains/formal/pages/LoginPage.js
import React from 'react';
import LoginForm from '../../../components/auth/LoginForm';

const LoginPage = () => (
  <LoginForm sistema="formal" titulo="Investigación Formal" homeRoute="/formal" />
);

export default LoginPage;