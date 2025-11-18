const { fakerPT_PT: faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

const credentials = {
  email: process.env.TEST_USER_EMPLOYEE,
  password: process.env.TEST_PASSWORD,
};

const BASIC_HEADERS = {
  'Content-Type': 'application/json',
};

const getCredentials = (type = 'valid') => {
  switch (type) {
  case 'valid':
    return credentials;
  case 'wrongPassword':
    return { ...credentials, password: faker.internet.password() };
  case 'invalidEmail':
  case 'invalid':
    return { ...credentials, email: 'invalid-email' };
  case 'empty':
    return { email: '', password: '' };
  case 'blank':
    return { email: ' ', password: ' ' };
  case 'tooShort':
    return { ...credentials, email: 'a@b.c' };
  case 'tooLong':
    return { ...credentials, email: faker.lorem.words(100) + '@example.com' };
  case 'sqlInjection':
    return { ...credentials, email: `${faker.internet.email()}' OR '1'='1` };
  case 'passwordInjection':
    return { ...credentials, password: '\' OR \'1\'=\'1' };
  case 'longPassword':
    return { ...credentials, password: 'a'.repeat(1000) };
  case 'unicode':
    return { ...credentials, email: `${faker.person.firstName()}🔑@example.com` };
  case 'longInput':
    return { ...credentials, email: faker.lorem.words(50) + '@example.com' };
  case 'specialChars':
    return { ...credentials, email: 'test+special@example.com' };
  case 'unregistered':
    return { ...credentials, email: `unregistered_${faker.string.alphanumeric(8)}@nonexistent.com` };
  case 'null':
  case 'nullValues':
    return { email: null, password: null };
  case 'missingEmail':
    return { password: credentials.password };
  case 'missingPassword':
    return { email: credentials.email };
  case 'empty_object':
    return {};
  case 'random':
  default:
    return {
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password(),
      phone: faker.phone.number('9########'),
    };
  }
};

const postRequest = async (request, endpoint, data) => {
  return request.post(endpoint, {
    headers: BASIC_HEADERS,
    data,
  });
};

const getRequest = async (request, endpoint) => {
  return request.get(endpoint, {
    headers: BASIC_HEADERS,
  });
};

const loadJsonData = (type) => {
  const jsonPath = path.join(__dirname, `../../data/json/${type}.json`);
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
};

const modifyData = (data, modifications) => {
  const modifiedData = JSON.parse(JSON.stringify(data));

  Object.entries(modifications).forEach(([key, value]) => {
    const keys = key.split('.');
    let current = modifiedData;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  });

  return modifiedData;
};

module.exports = {
  validCredentials: credentials,
  getCredentials,
  postRequest,
  getRequest,
  loadJsonData,
  modifyData,
};
