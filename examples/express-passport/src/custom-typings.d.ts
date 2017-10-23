declare module 'celebrate' {
  import Joi = require('joi');
  import express = require('express');

  function Celebrate(
    schema: CelebrateSchema,
    options?: Joi.ValidationOptions
  ): express.RequestHandler;

  interface CelebrateSchema {
    params?: Joi.ObjectSchema;
    headers?: Joi.ObjectSchema;

    query?: Joi.ObjectSchema;

    body?: Joi.ObjectSchema;
  }

  namespace Celebrate {
    export function errors(): express.ErrorRequestHandler;
  }

  export = Celebrate;
}
