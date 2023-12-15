import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import crypto from 'crypto';

const client = new DynamoDBClient({ region: 'us-east-1' });

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
) => {
  event.


  return {
    statusCode: 200,
    body: JSON.stringify({
      msg: 'This is a message',
    }),
  };
};
