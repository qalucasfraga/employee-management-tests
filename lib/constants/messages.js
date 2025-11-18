const COMMON_MESSAGES = {
  STATUS: {
    SUCCESS: 'ok',
    ERROR: 'error',
  },
  LOADING: {
    SPLASH_SCREEN: 'Ajudamos a tomar melhores decisões financeiras',
  },
  ERROR: {
    UNAUTHORIZE_USER: 'É necessário indicar um email',
    NOT_FOUND_USER: 'Utilizador não encontrado',
    INVALID_EMAIL: 'O email é inválido',
    INVALID_CODE: 'O código inserido é inválido. Tente novamente.',
    EXPIRED_CODE: 'O código expirou',
    HTML_ERROR: 'Slim Application Error',
    SOMETHING_ERROR: 'Something went wrong',
    EMPTY_EMAIL_EN: 'Email must not be empty',
    INVALID_EMAIL_EN: 'Email must be valid email',
    ERROR_HTTP: 'Http failure response',
    NETWORK_ERROR: 'Network Error',
    CONNECTION_FAILED: 'Connection failed',
    TIMEOUT_ERROR: 'Request timeout',
  },
};

const FILE_UPLOAD_MESSAGES = {
  ERROR: {
    DUPLICATE_FILE: 'Este arquivo já foi enviado',
    FILE_TOO_LARGE: 'Http failure response',
    INVALID_FILE_TYPE: 'tipo de arquivo não suportado',
  },
};

const LOGIN_MESSAGES = {
  ERROR: {
    UNSUCCESSFUL_LOGIN: 'Login sem sucesso. Verifique o seu e-mail ou palavra-passe e tente novamente.',
    INVALID_EMAIL_OR_PHONE: 'O email ou o nº de telemóvel é inválido',
    LOGIN_FAILED: 'Login sem sucesso. Verifique o seu e-mail ou palavra-passe e tente novamente.',
    AUTHENTICATION_FAILED: 'authentication failed',
    REQUIRED_FIELD: 'Campo de preenchimento obrigatório',
    INVALID_EMAIL_FORMAT: 'Email inválido',
    INVALID_PASSWORD_FORMAT: 'Password inválido',
  },
  SUCCESS: {
    LOGIN_STATUS: 'ok',
  },
};

const PROFILE_MESSAGES = {
  SUCCESS: {
    SAVE_CHANGES: 'As alterações foram gravadas com sucesso',
    SAVE_NEWSLETTER: 'Subscreveu a newsletter do Doutor Finanças',
    PASSWORD_CHANGED: 'A sua palavra-passe foi alterada com sucesso',
  },
  ERROR: {
    PASSWORD_OLD_ERROR: 'A palavra-passe antiga está incorrecta',
    CANCEL_NEWSLETTER: 'Subscrição cancelada com sucesso',
    REQUIRED_FIELDS: 'Por favor, preencha todos os campos obrigatórios.',
    SAME_PASSWORD: 'A nova palavra-passe deve ser diferente da atual',
    PASSWORDS_NOT_MATCH: 'As palavras-passe não coincidem',
    WEAK_PASSWORD: 'A palavra-passe não cumpre os requisitos de segurança',
  },
};

const SMS_MESSAGES = {
  ERROR: {
    NO_ACCESS_USER: 'Sem autorização de acesso',
    INVALID_PHONE: 'Número de telefone inválido',
  },
};

const MESSAGES = {
  COMMON: COMMON_MESSAGES,
  FILE_UPLOAD: FILE_UPLOAD_MESSAGES,
  LOGIN: LOGIN_MESSAGES,
  PROFILE: PROFILE_MESSAGES,
  SMS: SMS_MESSAGES,
};

module.exports = {
  MESSAGES,
};
