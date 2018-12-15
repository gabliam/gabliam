// import { METADATA_KEY, ERRORS_MSGS } from '../constants';

// export interface responseStatus {
//   status:
// }

// export const ResponseStatus = () => (target: any, key?: string | symbol) => {
//   let realTarget = target;
//   // if key != undefined then it's a property decorator
//   if (key !== undefined) {
//     realTarget = target.constructor;
//   }
//   if (
//     Reflect.hasOwnMetadata(
//       METADATA_KEY.validate,
//       realTarget,
//       key!
//     ) === true
//   ) {
//     throw new Error(ERRORS_MSGS.DUPLICATED_VALIDATE_DECORATOR);
//   }
// };
