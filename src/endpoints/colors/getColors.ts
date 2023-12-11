import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      msg: 'This is a message',
    }),
  };
};
