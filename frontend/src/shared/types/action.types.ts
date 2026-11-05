export type ActionStatus<TField extends string = string> =
  | { status: "idle" }
  | { status: "ok"; message?: string }
  | {
      status: "error";
      message?: string;
      fieldErrors?: Partial<Record<TField, string>>;
    };
