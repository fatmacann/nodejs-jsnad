'use strict'
const assert = require('assert')
// Buffer.allocUnsafe yerine Buffer.alloc kullan
const buffer = Buffer.alloc(4096)

for (const byte of buffer) assert.equal(byte, buffer[0])
console.log('passed!')

