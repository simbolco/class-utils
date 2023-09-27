/**
 * @file Provides type information for JavaScript class utilities.
 * @author Simon Struthers
 * @copyright The Simon Bolivar Company 2023
 * @license MPL-2.0
 * @version 1.0
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Type representing a constructor. */
type Constructor<T extends object> = {
    new(...args: any[]): T;
    prototype: T;
};

/**
 * Determines if a given object is a constructor.
 */
export function isConstructor(o: unknown): o is Constructor<object>;

/**
 * Retrieve an iterator of the property descriptors for a given object.
 * 
 * @param o An object.
 * @returns An iterator over the object's own property names & descriptors.
 */
export function propertiesOf(o: object):
    IterableIterator<[string | symbol, PropertyDescriptor]>;

/**
 * Decorator which restricts all methods, getters, and setters of a given class
 * to instances of said class.
 * 
 * This also adds a `Symbol.toStringTag` property to the class if it has not
 * already been provided.
 * 
 * @param iface A constructor to restrict the methods, getters, and setters of.
 * @param metadata Compiler- or runtime-provided decorator metadata.
 */
export function restrict<Cons extends Constructor<object>>(
    iface: Cons,
    metadata?: ClassDecoratorContext<Cons>
): Cons;
/**
 * Decorator which restricts all methods, getters, and setters of a given class
 * to instances of said class.
 * 
 * This also adds a `Symbol.toStringTag` property to the class if it has not
 * already been provided.
 * 
 * @param options Property keys to not apply restrictions to.
 */
export function restrict(options: {
    exclude?: PropertyKey[];
    excludeStatic?: PropertyKey[];
}): <Cons extends Constructor<object>>(
    iface: Cons,
    metadata: ClassDecoratorContext<Cons>
) => Cons;
/**
 * Restricts all methods, getters, and setters of a given class to instances
 * of said class.
 * 
 * This also adds a `Symbol.toStringTag` property to the class if it has not
 * already been provided.
 * 
 * @param iface A constructor to restrict the methods, getters, and setters of.
 * @param options Property keys to not apply restrictions to.
 */
export function restrict<Cons extends Constructor<object>>(
    iface: Cons,
    options: {
        exclude?: (keyof Cons['prototype'])[];
        excludeStatic?: (keyof Cons)[];
    }
): Cons;

/**
 * Seals a constructor and its prototype such that they cannot be externally
 * modified.
 * 
 * @param iface A constructor to seal.
 * @param metadata Compiler- or runtime-provided decorator metadata.
 */
export function sealed<Cons extends Constructor<object>>(
    iface: Cons,
    metadata?: ClassDecoratorContext<Cons>
): Cons;
