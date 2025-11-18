let cachedTokens = {};

const getToken = async (request) => {
  const cacheKey = 'EMPLOYEE_MANAGEMENT_USER';
  if (cachedTokens[cacheKey]) return cachedTokens[cacheKey];

  const response = await request.post(process.env.ID_API + '/api/v1/login', {
    headers: { 'Content-Type': 'application/json' },
    data: {
      email: process.env.TEST_USER_EMPLOYEE,
      password: process.env.TEST_PASSWORD,
    },
  });

  const responseData = await response.json();
  cachedTokens[cacheKey] = responseData.token;
  return cachedTokens[cacheKey];
};

const clearCache = () => {
  cachedTokens = {};
};

module.exports = {
  getToken,
  clearCache,
};
