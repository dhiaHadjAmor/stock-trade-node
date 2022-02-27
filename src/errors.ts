export class ConflictError extends Error {
  statusCode?: number | undefined;

  constructor(message) {
    super(message);
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
    this.statusCode = 409;
    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends Error {
  statusCode?: number | undefined;
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = 400;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends Error {
  statusCode?: number | undefined;
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = 404;
    Error.captureStackTrace(this, this.constructor);
  }
}
