const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { validateRequest, successResponse, errorResponse } = require('../../infrastructure/utils');
const logger = require('../../infrastructure/logger');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
});

module.exports.handler = async (event) => {
  try {
    logger.info('Processing user registration request', { event });

    // Validate input
    const { isValid, errors, value } = validateRequest(userSchema, event.body);
    if (!isValid) {
      logger.warn('Validation failed', { errors });
      return errorResponse(400, 'Validation failed', errors);
    }

    const { email, password, firstName, lastName, phoneNumber } = value;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const userId = uuidv4();
    const timestamp = new Date().toISOString();
    const params = {
      TableName: process.env.USERS_TABLE || 'UsersTable',
      Item: {
        userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        verificationStatus: 'PENDING',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };

    await dynamoDb.put(params).promise();

    logger.info('User registered successfully', { userId });

    return successResponse({ message: 'User registered successfully', userId }, 201);
  } catch (err) {
    logger.error('Error during user registration', { error: err.message, stack: err.stack });
    return errorResponse(500, 'Internal server error', err.message);
  }
};