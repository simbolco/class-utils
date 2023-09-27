# Class Utilities Library
An ECMAScript 5+ library which provides utilities for classes or class-like
functions. TypeScript support is provided out of the box.

This library is web, CommonJS, and RequireJS compatible. In web browsers, the
global variable `classUtils` contains this library's exports.

The code which this library consists of is licensed under the [Mozilla Public
License version 2.0](http://mozilla.org/MPL/2.0/). This means that this code can
be reused and integrated into other projects so long as the following conditions
are satisfied:

1. The source code pertaining to this library must be publically accessible and
   available when distributed.
2. A copy of the license and copyright notice must be included with the library.
3. Any modifications to this library must be released under the Mozilla Public
   License version 2.0 or a sufficiently similar license when distributing it.

## Basic Usage

### `restrict`
The `restrict` function restricts all configurable instance getters, setters,
and methods of a given class to only being able to be called by instances said
class. `restrict` additionally sets all non-configurable static and method
properties of a class to be non-configurable and non-enumerable. Data properties
are further set as non-writable and, finally, the class is given a
`Symbol.toStringTag` which matches the `name` property of the constructor.

```js
import { restrict } from '@simbolco/class-utils';
class A_Class {
    get x() {
        // ...
    }

    y() {
        // ...
    }

    // if static blocks are supported:
    static {
        restrict(this);
    }
}

// if static blocks aren't supported:
restrict(A_Class);

A_Class.prototype.x; // throws a TypeError
A_Class.prototype.y.call(new Date); // throws a TypeError
A_Class.prototype.x = function() {
    // ...
}; // fails
```

### `sealed`
The `sealed` function prevents further extension of the static or instance
properties and methods of a class using `Object.seal`.

```js
import { sealed } from '@simbolco/class-utils';

class SomeClass {
    // ...

    // if static blocks are supported:
    static {
        sealed(this);
    }
}

SomeClass.new_property = 1; // fails
```

### `isConstructor`
The `isConstructor` function duck types whether a given function is a
constructor.

```js
import { isConstructor } from '@simbolco/class-utils';

class AnotherClass {
    // ...
}

isConstructor(AnotherClass);            //> true
isConstructor(String);                  //> true
isConstructor("a string");              //> false
isConstructor(Array.prototype.indexOf); //> false
isConstructor(() => "arrow function");  //> false
isConstructor(function() {              //> true !!
    return "classic function";
});
```

### `propertiesOf`
The `propertiesOf` function returns an iterator over a given object's own keys
and property descriptors. The keys includes both strings and symbols.

This is provided as an ease of implementing your own class decorators or utility
functions.

```js
import { propertiesOf } from '@simbolco/class-utils';

for (const [key, descriptor] of propertiesOf(AnotherClass.prototype)) {
    // process the descriptor...
}
```

## Advanced Usage
### Decorators
In TypeScript with the [experimental decorators extension enabled](
https://www.typescriptlang.org/docs/handbook/decorators.html) or JavaScript
implementations which support the [TC-39 class decorators proposal](
https://github.com/tc39/proposal-decorators), the `restrict` and `sealed`
functions can be used as decorators:

```ts
@sealed @restrict class LockedDown {
    // ...
}
```

### Excluding properties from being restricted
The `restrict` function takes an optional *options* parameter in both its
functional and decorator forms. With it, one can specify static and instance
property keys which the implementor would prefer to not have restricted or
otherwise set as non-configurable, non-enumerable, and non-writable.

```ts
const FunctionalOptions = restrict(class {
    // ...
}, {
    exclude: ['propD', 'propE'],
    excludeStatic: [Symbol.toStringTag]
});

@restrict({
    exclude: ['propA', 'propB'],
    excludeStatic: ['propC']
}) class DecoratorOptions {
    static propC = 1;
    static propD = 2;

    // ...
}

DecoratorOptions.propC = 3; // succeeds
DecoratorOptions.propD = 4; // fails

DecoratorOptions.propC; //> 3
DecoratorOptions.propD; //> 2
```

Classes which have already been passed into `restrict` cannot be `restrict`ed
again, thus static or instance excludes can only be provided once.

### Custom `@@toStringTag` name
A custom `Symbol.toStringTag` string can be passed as an option to `restrict`
via the `name` property of the *options* parameter:

```ts
@restrict({ name: "Y" }) class X {}
Object.prototype.toString.call(new X) //> "[object Y]"
```

## Programming Interface

### `isConstructor`
#### Parameters
- *obj* - An object.

#### Returns
True if *obj* duck types to a constructor (i.e. its `typeof` is "`function`" and
has its own `prototype` property). False otherwise.

### `propertiesOf`
#### Parameters
- *obj* - An object.

#### Returns
An iterator of a *obj*'s own property keys and descriptors as a read-only array.

### `restrict`
A decorator which performs the following actions on all configurable properties
of a given constructor and its prototype that are not explicitly marked in the
*options* parameter as excluded:
- Sets the property to be non-configurable.
- Sets the property to be non-enumerable.
- If the property is a data property, it is set to be non-writable.

In addition to the above steps, the following actions are performed on all
configurable properties of a given constructor's prototype, except for the
`constructor` property:
- If the property is a getter/setter property, the get and set functions are
  restricted to only allowing calls from class instances.
- If the property is a data property corresponding to a function, the property
  is restricted to only allowing calls from class instances.

If the provided constructor does not already have its own a `Symbol.toStringTag`
property defined, this function will provide one corresponding to either the
`name` field of the *options* parameter or the `name` property of the provided
constructor.

#### Parameters
- *iface* - A constructor to restrict the methods, getters, and setters of.
- *options* - (optional) Property keys to not apply restrictions to and/or
              the name tag to provide to *iface*.

#### Returns
The *iface* parameter.

### `sealed`
A decorator which seals a provided constructor and its prototype, preventing
extension, modification, or tampering of their properties.

#### Parameters
- *iface* - A constructor to seal.

#### Returns
The *iface* parameter.
