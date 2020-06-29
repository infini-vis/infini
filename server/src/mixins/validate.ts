import {validate as classValidate} from 'class-validator';
import {plainToClass} from 'class-transformer';

export default function validateMixin(ctx) {
  ctx.validate = async function validate(ClassType) {
    // convert plain request body object to classBasedObj
    // then execute the validation
    const errors = await classValidate(plainToClass(ClassType, this.request.body));

    errors.forEach(error => {
      let constraints = error.constraints;
      let currentError = error;
      while (!constraints && currentError) {
        constraints = currentError.constraints;
        currentError = currentError.children[0];
      }

      // if we get any errors, throw it
      // any error will be handled in middlewares/error
      for (let i in constraints) {
        this.throw(400, constraints[i]);
      }
    });

    return errors;
  };
  return ctx;
}
