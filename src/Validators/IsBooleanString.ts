import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsBooleanString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isBooleanString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return value === 'true' || value === 'false' || value === true || value === false || value === undefined;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a boolean string ("true" or "false")`;
        },
      },
    });
  };
}
