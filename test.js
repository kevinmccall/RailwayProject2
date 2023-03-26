function MyObj(num) {
  this.num = num;
}

const a = [new MyObj(1), new MyObj(2), new MyObj(3)];
console.log('a :>> ', a);

const b = a.slice();

console.log('b :>> ', b);

console.log('adding element to b');

b.push(new MyObj(4));

console.log('a :>> ', a);
console.log('b :>> ', b);


console.log('changing value of b[0]');
b[0].num = 6;

console.log('a :>> ', a);
console.log('b :>> ', b);
