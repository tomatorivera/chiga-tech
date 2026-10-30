export type ActionStatus<TCampo extends string = string> =
  | { status: "idle" }
  | { status: "ok"; message?: string }
  | {
      status: "error";
      message?: string;
      fieldErrors?: Partial<Record<TCampo, string>>;
      previousValues?: Partial<Record<TCampo, string>>;
    };
