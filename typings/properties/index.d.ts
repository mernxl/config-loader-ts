declare module 'properties' {
  export interface ParseOptions {
    path: boolean;
    strict: boolean;
    comments: boolean;
    separators: boolean;
    sections: boolean;
    namespaces: boolean;
    variables: boolean;
    include: boolean;
    vars: Record<string, any>;
  }

  export function parse<PropType = Record<string, any>>(
    data: string,
    options: Partial<ParseOptions>,
    cb: (err: any, props: PropType) => any,
  );
}
