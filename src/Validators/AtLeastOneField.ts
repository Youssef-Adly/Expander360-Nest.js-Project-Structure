import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function AtLeastOneField(
  propertyNames: (keyof any)[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'atLeastOneField',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [propertyNames],
      validator: {
        validate(_: any, args: ValidationArguments) {
          const [fields] = args.constraints;
          return fields.some((field: string) => {
            const value = (args.object as any)[field];
            return value !== undefined && value !== null && value !== '';
          });
        },
        defaultMessage(args: ValidationArguments) {
          return `At least one field must be provided: ${args.constraints[0].join(', ')}`;
        },
      },
    });
  };
}
