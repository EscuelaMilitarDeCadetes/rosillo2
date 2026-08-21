// src/domains/formativa/pages/LoginPage.js
import React from 'react';
import LoginForm from '../../../components/auth/LoginForm';

const LoginPage = () => (
  <LoginForm sistema="formativa" titulo="Investigación Formativa" homeRoute="/formativa" />
);

export default LoginPage;