import { ExpressionParser } from './expression-parser';


const parser = new ExpressionParser({
  hello: (name: string) => 'hello ' + name
});
const expression = parser.parseExpression('hello($user.name)');
console.log(expression.getValue({
  '$user': {
    name: 'Darth Vader'
  }}));

  console.log(expression.getValue({
    '$user': {
      name: 'Luke'
    }}));

    console.log(expression.getValue());
