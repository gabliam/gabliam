export const TYPE = {
  RabbitController: 'RabbitControllerType',
};

export const METADATA_KEY = {
  cunit: '_RabbitCuni',
  RabbitController: '_RabbitController',
  RabbitcontrollerParameter: '_Rabbitcontroller-parameter',
  RabbitHandler: '_RabbitHandler',
};

export const ERRORS_MSGS = {
  DUPLICATED_CONTROLLER_DECORATOR: `Cannot apply @RabbitController decorator multiple times.`,
  DUPLICATED_CUNIT_DECORATOR: `Cannot apply @CUnit decorator multiple times.`,
};

export const UNDEFINED_VALUE = '$$__##UNDEFINED##__$$';
