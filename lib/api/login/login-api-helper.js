const commonAPI = require('../common/common-api-helper');

const getLoginBody = (type = 'valid') => {
  const credentials = commonAPI.getCredentials(type);
  return {
    email: credentials.email,
    password: credentials.password,
  };
};

const loginApi = async (request, type = 'valid') => {
  const data = getLoginBody(type);
  return request.post(`${process.env.ID_API}/api/v1/login`, {
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
};

module.exports = {
  getLoginBody,
  loginApi,
};
