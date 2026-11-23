export class EventEmitter2 {
  emit(_event: string | symbol, ..._values: unknown[]): boolean {
    return true;
  }
  emitAsync(_event: string | symbol, ..._values: unknown[]): Promise<unknown[]> {
    return Promise.resolve([]);
  }
  on(_event: string | symbol, _listener: (...args: unknown[]) => void): this {
    return this;
  }
}

export const EventEmitterModule = {
  forRoot: (_options?: unknown) => ({
    module: class MockEventEmitterModule {},
    providers: [
      {
        provide: EventEmitter2,
        useClass: EventEmitter2,
      },
    ],
    exports: [EventEmitter2],
  }),
};

export const OnEvent = (_event: string | symbol, _options?: unknown): MethodDecorator => {
  return (_target: unknown, _propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    return descriptor;
  };
};
