function first() {
  console.log("first(): factory evaluated")
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    console.log("first(): called")
  }
}

function second() {
  console.log("second(): factory evaluated")
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    console.log("second(): called")
  }
}

export class ExampleClass {
  @first()
  @second()
  method() {
    console.log("example class method")
  }
}
