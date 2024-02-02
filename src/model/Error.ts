export class ClientError extends Error {
  statusCode;
  constructor(
    message: string = 'This error was caused by the client',
    statusCode: number = 400,
    name: string = 'ClientError'
  ) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ClientError.prototype);
  }
}

export class OwnServerError extends Error {
  statusCode;
  constructor(
    message: string = 'This error was caused by our own server',
    statusCode: number = 500,
    name: string = 'OwnServerError'
  ) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, OwnServerError.prototype);
  }
}

export class ThirdPartyServerError extends Error {
  statusCode;
  constructor(
    message: string = 'This error was caused server side, but not by our own server, instead it was caused by a third party service server we are using (e.g. DynamoDB internal errors, S3 internal errors, etc.)',
    statusCode: number = 500,
    name: string = 'ThirdPartyServerError'
  ) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ThirdPartyServerError.prototype);
  }
}
