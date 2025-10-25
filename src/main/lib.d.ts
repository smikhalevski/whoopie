interface ArrayConstructor {
  isArray<T extends readonly unknown[] | unknown[]>(value: T | unknown): value is T;
}
