declare module 'command-line-usage' {
  export interface Section {
    header?: string;
    content?: string | Content[];
    optionList?: OptionDefinition[];
  }

  export interface Content {
    desc: string;
    example: string;
  }

  export interface OptionDefinition {
    name: string;
    type: BooleanConstructor | StringConstructor;
    description: string;
    defaultValue: boolean | string;
  }

  export default function commandLineUsage(
    section: Section | Section[],
  ): string;
}
