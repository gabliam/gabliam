import { Config, Init } from '@gabliam/core';
import { WebConfiguration } from '@gabliam/web-core';
import { ValidateSendErrorInterceptor, ValidateInterceptor } from './validate';

@Config()
export class ValidateConfig {
  constructor(private webConfiguration: WebConfiguration) {}

  @Init()
  init() {
    this.webConfiguration.useGlobalInterceptor(
      ValidateSendErrorInterceptor,
      ValidateInterceptor
    );
  }
}
