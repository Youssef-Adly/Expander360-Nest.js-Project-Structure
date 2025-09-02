import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function SequentialValidation(
  validators: Array<{
    validator: (value: any) => boolean;
    message: string;
  }>,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'sequentialValidation',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [validators],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [validatorsList] = args.constraints;

          for (const validator of validatorsList) {
            if (!validator.validator(value)) {
              // Set the error message for this specific validation
              (args.object as any)[`${propertyName}_error`] = validator.message;
              return false;
            }
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const [validatorsList] = args.constraints;
          const errorMessage = (args.object as any)[`${args.property}_error`];
          return errorMessage || 'Validation failed';
        },
      },
    });
  };
}
