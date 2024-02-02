import { DynamoDBServiceException } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult } from 'aws-lambda';
import { ValiError } from 'valibot';
import { OpenSearchClientError } from '@opensearch-project/opensearch/lib/errors.js';
import {
  ClientError,
  OwnServerError,
  ThirdPartyServerError,
} from '../model/Error';

export const inferRequestResponseFromError = (
  error: unknown
): APIGatewayProxyResult => {
  const catchedError = error as Record<string, unknown>;
  if (
    catchedError instanceof ClientError ||
    catchedError instanceof OwnServerError ||
    catchedError instanceof ThirdPartyServerError
  ) {
    return {
      statusCode: catchedError.statusCode,
      body: JSON.stringify(catchedError),
    };
  } else if (
    catchedError instanceof TypeError ||
    catchedError instanceof SyntaxError ||
    catchedError instanceof RangeError ||
    catchedError instanceof ReferenceError ||
    catchedError instanceof URIError
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify(catchedError),
    };
  } else if (catchedError instanceof ValiError) {
    return {
      statusCode: 400,
      body: JSON.stringify(catchedError),
    };
  } else if (catchedError instanceof DynamoDBServiceException) {
    return {
      statusCode: catchedError.$response?.statusCode ?? 500,
      body: JSON.stringify(catchedError),
    };
  } else if (catchedError instanceof OpenSearchClientError) {
    return {
      statusCode: 500,
      body: JSON.stringify(catchedError),
    };
  } else if (
    'type' in catchedError &&
    (catchedError.type === 'api_error' ||
      catchedError.type === 'card_error' ||
      catchedError.type === 'idempotency_error' ||
      catchedError.type === 'invalid_request_error')
  ) {
    return {
      statusCode: (catchedError.code as number) ?? 500,
      body: JSON.stringify(catchedError),
    };
  }

  return {
    statusCode: 500,
    body: JSON.stringify({
      ...catchedError,
      message: `${catchedError}. Additional information: This error is not currently handled by the API, please update the backend code to handle this error.`,
    } as Error),
  };
};
