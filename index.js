/**
 * @file Provides utility functions for JavaScript classes.
 * @author Simon Struthers
 * @copyright The Simon Bolivar Company 2023
 * @license MPL-2.0
 * @version 1.0
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
!function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ?
        module.exports = factory() :
    typeof define === 'function' && define.amd ?
        define(factory) :
    global.classUtils = factory();
}(this, function() {
    /**
     * @template {PropertyKey} T
     * 
     * @param {T} x A global property.
     * 
     * @returns {T extends keyof typeof globalThis ?
    * (typeof globalThis)[T] : unknown}
    */
   function getGlobal(x) {
       return this[x];
   }

    /**
    * @param {object} o An object.
    * 
    * @returns {Iterator<PropertyDescriptor>}
    */
    function propertiesOf(o) {
        o = Object(o);

        var names = Object.getOwnPropertyNames(o),
            getOwnSymbols = Object.getOwnPropertySymbols,
            iteratorSymbol = getGlobal('Symbol').iterator,
            index = 0,
            result = Object.create(Object.prototype, {
                done: { value: false, writable: true },
                value: { value: [] }
            }),
            iterator = {
                next() {
                    if (index >= names.length) {
                        result.done = true;

                        result.value.length = 0;
                        if (!Object.isFrozen(result.value))
                            Object.freeze(result.value);

                        return result;
                    }

                    var key = names[index++];
                    result.value.length = 2;
                    result.value[0] = key;
                    result.value[1] = Object.getOwnPropertyDescriptor(o, key);
                    return result;
                }
            };

        getOwnSymbols && (names = names.concat(getOwnSymbols(o)));
        iteratorSymbol && (iterator[iteratorSymbol] = function() {
            return iterator;
        });

        return iterator;
    }

    /**
    * @template {object} T
    * @template {(...args: any[]) => any} F
    * 
    * @param {{ new(...args: any[]): T; prototype: T; }} iface
    * @param {string} prop Property name.
    * @param {F} original The function to replace with a validating version.
    * 
    * @returns {F} 
    */
    function validateInterface(iface, prop, original) {
        return Object.setPrototypeOf(function() {
            if (this instanceof iface)
                return original.apply(this, arguments);

            throw TypeError(
                "'" + prop +
                "' called on an object that does not implement interface " +
                iface.name + ".");
        }, original);
    }

    function restrictProperties(object, isConstructor, exceptFor) {
        exceptFor = exceptFor || 0;

        var descriptors = {},
            indexOf = Array.prototype.indexOf,
            result,
            properties,
            prop,
            descriptor;

        for (properties = propertiesOf(object);
            !(result = properties.next()).done;
        ) {
            prop = result.value[0];
            descriptor = result.value[1];

            if (indexOf.call(exceptFor, prop) >= 0 || !descriptor.configurable)
                continue;

            descriptor.configurable = false;
            descriptor.enumerable = false;

            if ('value' in descriptor) {
                descriptor.writable = false;
                if (!isConstructor &&
                    typeof descriptor.value == 'function' &&
                    prop !== 'constructor'
                ) {
                    descriptor.value = validateInterface(
                        object.constructor,
                        prop,
                        descriptor.value);
                }
            } else if (!isConstructor) {
                if (descriptor.get)
                    descriptor.get = validateInterface(
                        object.constructor,
                        'get ' + prop,
                        descriptor.get);
                if (descriptor.set)
                    descriptor.set = validateInterface(
                        object.constructor,
                        'set ' + prop,
                        descriptor.set);
            }

            descriptors[prop] = descriptor;
        }

        return Object.defineProperties(object, descriptors);
    }

    /**
     * @template {PropertyKey} T
     * 
     * @param {object} obj An object.
     * @param {T} key A property key.
     * 
     * @returns {obj is { [_ in T]: unknown; }}
     */
    function hasOwn(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }

    function isConstructor(iface) {
        return typeof iface == 'function' && hasOwn(iface, 'prototype');
    }

    function verifyIsConstructor(iface, name) {
        name = name || 'iface';
        if (!isConstructor(iface))
            throw TypeError(name + ' must be a constructor.');
        return iface;
    }

    /**
    * @type {WeakSet<abstract new(...args: any[])> |
    * (abstract new(...args: any[]))[]}
    */
    var restrictMap = getGlobal('WeakMap') ? new WeakSet : [];

    function restrict(iface, exceptFor) {
        if (typeof iface === 'object') {
            exceptFor = iface;
            return function(iface) {
                return restrict(verifyIsConstructor(iface), exceptFor);
            };
        }

        if (restrictMap.has ?
                restrictMap.has(iface) :
                restrictMap.indexOf(iface) >= 0
        ) {
            return iface;
        }

        exceptFor = exceptFor === void 0 ? {} : exceptFor;
        var prototype = verifyIsConstructor(iface).prototype,
            toStringTag = getGlobal('Symbol').toStringTag;

        if (toStringTag && !hasOwn(prototype, toStringTag)) {
            Object.defineProperty(prototype, toStringTag, {
                value: hasOwn(exceptFor, 'name') ? exceptFor.name : iface.name
            });
        }

        restrictProperties(prototype, 0, exceptFor.exclude);
        return restrictProperties(iface, 1, exceptFor.excludeStatic);
    }

    function sealed(iface) {
        Object.seal(verifyIsConstructor(iface));
        Object.seal(iface.prototype);
        return iface;
    }

    return {
        isConstructor: isConstructor,
        propertiesOf: propertiesOf,
        restrict: restrict,
        sealed: sealed
    };
});
