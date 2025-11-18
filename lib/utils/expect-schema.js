const toMatchSchema = (received, schema) => {
  try {
    const { error } = schema.validate(received, {
      presence: 'required',
      abortEarly: false,
    });

    if (!error) {
      return {
        pass: true,
        message: () => 'Schema validation passed',
      };
    }

    return {
      pass: false,
      message: () => `Schema validation failed: ${error.details.map((d) => d.message).join(', ')}`,
    };
  } catch (err) {
    return {
      pass: false,
      message: () => `Schema validation threw an error: ${err.message}`,
    };
  }
};

module.exports = { toMatchSchema };
