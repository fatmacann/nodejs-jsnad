# Buffer

`Buffers` are an abstraction that allows us to deal with raw binary data in Node.js. They are particularly relevant when we are dealing with files and networks or I/O in general.

You can create buffer from string, bytes array, hexadecimal string, base64 string.

```
const bufferFromString = Buffer.from('Ciao human')
const bufferFromByteArray = Buffer.from([67, 105, 97, 111, 32, 104, 117, 109, 97, 110])
const bufferFromHex = Buffer.from('4369616f2068756d616e', 'hex')
const bufferFromBase64 = Buffer.from('Q2lhbyBodW1hbg==', 'base64')
```

If you want to inspect the content of a Buffer instance you can do that with the `.toString(encoding)` method, which accepts different types of encoding such as `base64`, `hex` or `utf8` (default value).

```
bufferFromString.toString('utf-8') // Ciao human ('utf-8' is the default)
bufferFromString.toString('hex') // 4369616f2068756d616e
bufferFromString.toString('base64') // Q2lhbyBodW1hbg==

```
