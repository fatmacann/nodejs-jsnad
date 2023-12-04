# File System

STDIN (Standard In) = Input stream used by a program to read input from command shell or Terminal.
STDOUT (Standard Out) = Output stream used by a program to write output.
STDERR (Standard Error) = Separated stream to STDOUT reserved to output errors.

```
process.stdin.on("data", (data) => { //listen for user input
  const name = data.toString().trim().toUpperCase(); //process data
  if (name !== "") {
    process.stdout.write(`Hello ${name}!`); //write output
  } else {
    process.stderr.write("Input was empty."); //write error
  }
});
```

`process` is an object containing all Node.js process information.
`process.stdin.on("data", (data) => {` will listen for a chunk of data. Every chunk is separated with a new line. `(data)` is a Buffer object.
`data.toString()` convert Buffer to string.

## Managing files with fs module

`fs` is a core module that provides API to interact with the file system.

```
const fs = require("fs");
const path = require("path");

const filepath = path.join(process.cwd(), "hello.txt");

const contents = fs.readFileSync(filepath, "utf8");
console.log("File Contents:", contents);

const upperContents = contents.toUpperCase();

fs.writeFileSync(filepath, upperContents);
console.log("File updated.");
```

`process.cwd()` current directory of Node.JS process.
`fs.readFileSync(filepath, "utf8")` utf8 is the encoding parameter. It is optional, if we don't pass it will return a Buffer object.

Both `fs.readFileSync` and `fs.writeFileSync` are synchronous, that means they will block/delay concurrent operations until the read/write is not completed. In Node.js you should try to avoid such synchronous operations.

## Working with files asynchronously

```
const fs = require("fs");
const path = require("path");

const filepath = path.join(process.cwd(), "hello.txt");

fs.readFile(filepath, "utf8", (err, contents) => { // callback
  if (err) {
    return console.log(err);
  }
  console.log("File Contents:", contents);
  const upperContents = contents.toUpperCase();

  fs.writeFileSync(filepath, upperContents);
  console.log("File updated.");
});
```

This code will be executed asynchronously. If you had a setInterval at the end, you will see that the setInterval will continue to be executed even while it's reading the file.

## Using the fs Promises API

fs Promises API = a subset of fs functions that return a Promise instance of use callbacks.

```
const fs = require("fs").promises; // use fs Promise API
const path = require("path");

const filepath = path.join(process.cwd(), "hello.txt");

function run() {
    fs.readFile(filepath, "utf8").then((contents) => {
        console.log("File Contents:", contents);
    })
}

run();
```

or using async/await

```
async function run() {
  try {
    const contents = await fs.readFile(filepath, "utf8");
    console.log("File Contents:", contents);
  } catch (error) {
    console.error(error);
  }
}

run();
```

## Inspecting file metadata

fs API are modeled around POSIX (Portable Operating System Interface), that is a set of common interfaces to define software open source.
fs include also APIs to help you reading directories and metadata.

```
const fs = require("fs");
const file = process.argv[2]; // argv contains all arguments passed when launch node

function printMetadata(file) {
  try {
    const fileStats = fs.statSync(file);
    console.log(fileStats);
  } catch (err) {
    console.error("Error reading file path:", file);
  }
}

printMetadata(file);
```

This will print all information about a file, such as size, creation time, updated time and others.

## Checking file access

If you want to check the existence of a file, you can use:
`fs.access()` or `fs.accessSync()`
This function checks the permissions for accessing the file, like read, write or execute.

## Modifing file permissions

You can modify the permissions of files using:
`fs.chmod()` or `fs.chmodSync()`
passing the path and `mode` parameter, as constant or as bit mask:

```
const fs = require("fs");
const file = "./file.txt";

fs.chmodSync(
  file,
  fs.constants.S_IRUSR |
    fs.constants.S_IWUSR |
    fs.constants.S_IRGRP |
    fs.constants.S_IWGRP |
    fs.constants.S_IROTH
);
```

that's the same of:

```
const fs = require("fs");
const file = "./file.txt";

fs.chmodSync(file, 0o664);
```

## Inspecting symbolic links

A symbolic link or symlink is a special file that store a reference to another file or directory.
Using stat or statSync on a symbolic link, it will return the information about the file referenced.
If you want to have information about the symlink itself, you can use:
`fs.lstat()` or `fs.lstatSync()`

NB: To execute node script inline you can use a Node CLI called Node REPL (Read-Eval-Print Loop). Using REPL you needn't import core modules, it automatically includes them.

## Watching for file updates

In Node.js you can watch for changes to a file or directory.
Using `watchFile()` you can listen file changes:

```
const fs = require("fs");
const file = "./file.txt";

fs.watchFile(file, (current, previous) => {
  return console.log(`${file} updated ${(current.mtime)}`);
});
```

`watchFile` has three arguments:

- file
- options: an object with the following properties:
  - BigInt = when true, the numberic value returned from object of Stats would be specified as BigInt.
  - Persistent = indicate if Node should continue to run while file are listened for changes.
  - Interval = How often should be polled for changes.
- listener function: executed every change.

fs provide another API to listen file changes, but it's faster but less consistent across multiple platform.

`watch` has three arguments:

- file
- options: an object with the following properties:
  - Recursive = specify if changes should be watched also in sub directories.
  - Persistent = indicate if Node should continue to run while file are listened for changes.
  - Encoding = Specify encoding for filename.
- listener function: executed every change. It's slightly different frin watchFile, it receives an `eventType` (change or rename) and a `trigger`, the file that triggered the event.

```
const fs = require("fs");
const file = "./file.txt";
const moment = require("moment");

fs.watch(file, (eventType, filename) => {
  const time = moment().format("MMMM Do YYYY, h:mm:ss a");
  return console.log(`${filename} updated ${time}`);
});

```

## Creating TCP server and client communication

TCP = Transmission Control Protocol

Socket TCP - Node provide a core module `net`
Client:

```
const net = require("net");

const HOSTNAME = "localhost";
const PORT = 3000;

const socket = net.connect(PORT, HOSTNAME); // connect to server

socket.write("World"); // send message to server

socket.on("data", (data) => { // on server data received
  console.log(data.toString());
});
```

Server:

```
const net = require("net");

const HOSTNAME = "localhost";
const PORT = 3000;

net
  .createServer((socket) => { // create server
    console.log("Client connected.");

    socket.on("data", (name) => { // on client data received
      socket.write(`Hello ${name}!`); // send message to client
    });
  })
  .listen(PORT, HOSTNAME);
```

There are many other events we can listen, like: `close`, `connect`, `error`, `ready`, `drain` (write buffer is empty), `end`.

UDP = User Datagram Protocol
UDP is a protocol faster than TCP that not require connection with server, but delivery is not guaranteed.
It's used in application where speed is more important like video calls, gaming, streaming.

Socket UDP - Node provide a core module `dgram`

```
const dgram = require('dgram');
const socket = dgram.createSocket('udp6');
socket.bind(PORT);

```
### tr
# File System

STDIN (Standard In) = Bir program tarafından komut kabuğundan veya Terminalden girişi okumak için kullanılan giriş akışı.
STDOUT (Standard Out) = Bir programın çıktı yazmak için kullandığı çıkış akışı.
STDERR (Standard Error) = Çıkış hatalarına ayrılmış STDOUT'a ayrılmış akış.

```
process.stdin.on("data", (data) => { //listen for user input
  const name = data.toString().trim().toUpperCase(); //process data
  if (name !== "") {
    process.stdout.write(`Hello ${name}!`); //write output
  } else {
    process.stderr.write("Input was empty."); //write error
  }
});
```

`process`, tüm Node.js süreç bilgilerini içeren bir nesnedir.
`process.stdin.on("data", (data) => {` bir yığın veriyi dinleyecektir. Her yığın yeni bir satırla ayrılır. `(data)` bir Buffer nesnesidir.
`data.toString()`, Buffer ı dizeye dönüştürür.

## Managing files with fs module

`fs`, API'nin dosya sistemiyle etkileşime girmesini sağlayan çekirdek bir modüldür.

```
const fs = require("fs");
const path = require("path");

const filepath = path.join(process.cwd(), "hello.txt");

const contents = fs.readFileSync(filepath, "utf8");
console.log("File Contents:", contents);

const upperContents = contents.toUpperCase();

fs.writeFileSync(filepath, upperContents);
console.log("File updated.");
```

Node.JS işleminin geçerli dizini `process.cwd()`.
`fs.readFileSync(filepath, "utf8")` utf8 kodlama parametresidir. İsteğe bağlıdır, eğer geçemezsek bir Buffer nesnesi döndürecektir.

Hem `fs.readFileSync` hem de `fs.writeFileSync` eşzamanlıdır; bu, okuma/yazma tamamlanıncaya kadar eşzamanlı işlemleri engelleyecekleri/erteleyecekleri anlamına gelir. Node.js'de bu tür eşzamanlı işlemlerden kaçınmaya çalışmalısınız.

## Working with files asynchronously

```
const fs = require("fs");
const path = require("path");

const filepath = path.join(process.cwd(), "hello.txt");

fs.readFile(filepath, "utf8", (err, contents) => { // callback
  if (err) {
    return console.log(err);
  }
  console.log("File Contents:", contents);
  const upperContents = contents.toUpperCase();

  fs.writeFileSync(filepath, upperContents);
  console.log("File updated.");
});
```

Bu kod eşzamansız olarak yürütülecektir. Eğer sonunda bir setInterval varsa, setInterval'ın dosyayı okurken bile çalıştırılmaya devam edeceğini göreceksiniz.

## Using the fs Promises API

fs Promises API = kullanım geri çağrılarının Promise örneğini döndüren fs işlevlerinin bir alt kümesi.

```
const fs = require("fs").promises; // use fs Promise API
const path = require("path");

const filepath = path.join(process.cwd(), "hello.txt");

function run() {
    fs.readFile(filepath, "utf8").then((contents) => {
        console.log("File Contents:", contents);
    })
}

run();
```

or using async/await

```
async function run() {
  try {
    const contents = await fs.readFile(filepath, "utf8");
    console.log("File Contents:", contents);
  } catch (error) {
    console.error(error);
  }
}

run();
```

## Inspecting file metadata

fs API'si, yazılımın açık kaynağını tanımlayan bir dizi ortak arayüz olan POSIX (Taşınabilir İşletim Sistemi Arayüzü)(Portable Operating System Interface) etrafında modellenmiştir.
fs ayrıca dizinleri ve meta verileri okumanıza yardımcı olacak API'leri de içerir.

```
const fs = require("fs");
const file = process.argv[2]; // argv contains all arguments passed when launch node

function printMetadata(file) {
  try {
    const fileStats = fs.statSync(file);
    console.log(fileStats);
  } catch (err) {
    console.error("Error reading file path:", file);
  }
}

printMetadata(file);
```

Bu, bir dosyayla ilgili boyut, oluşturulma zamanı, güncellenme zamanı ve diğerleri gibi tüm bilgileri yazdıracaktır.

## Checking file access

Bir dosyanın varlığını kontrol etmek istiyorsanız şunları kullanabilirsiniz:
`fs.access()` or `fs.accessSync()`
Bu işlev, dosyaya erişim için okuma, yazma veya yürütme gibi izinleri kontrol eder.

## Modifing file permissions

Aşağıdakileri kullanarak dosyaların izinlerini değiştirebilirsiniz:
`fs.chmod()` or `fs.chmodSync()`
yolu ve `mode` parametresini sabit veya bit maskesi olarak geçirmek:

```
const fs = require("fs");
const file = "./file.txt";

fs.chmodSync(
  file,
  fs.constants.S_IRUSR |
    fs.constants.S_IWUSR |
    fs.constants.S_IRGRP |
    fs.constants.S_IWGRP |
    fs.constants.S_IROTH
);
```

that's the same of:

```
const fs = require("fs");
const file = "./file.txt";

fs.chmodSync(file, 0o664);
```

## Inspecting symbolic links

Sembolik bağlantı veya sembolik bağlantı, başka bir dosyaya veya dizine referansı saklayan özel bir dosyadır.
Sembolik bir bağlantı üzerinde stat veya statSync kullanıldığında, başvurulan dosya hakkındaki bilgiler döndürülür.
Sembolik bağlantının kendisi hakkında bilgi sahibi olmak istiyorsanız şunları kullanabilirsiniz:
`fs.lstat()` or `fs.lstatSync()`

Not: Node komut dosyasını satır içinde yürütmek için Node REPL (Okuma-Değerlendirme-Yazdırma Döngüsü) adı verilen bir Node CLI'sini kullanabilirsiniz. REPL'i kullandığınızda çekirdek modülleri içe aktarmanıza gerek kalmaz, bunları otomatik olarak içerir.

## Watching for file updates

Node.js'de bir dosya veya dizinde yapılan değişiklikleri izleyebilirsiniz.
`watchFile()` kullanarak dosya değişikliklerini dinleyebilirsiniz:

```
const fs = require("fs");
const file = "./file.txt";

fs.watchFile(file, (current, previous) => {
  return console.log(`${file} updated ${(current.mtime)}`);
});
```

`watchFile` has three arguments:

- file
- options: aşağıdaki özelliklere sahip bir nesne:
   - BigInt = doğru olduğunda, Stats nesnesinden döndürülen sayısal değer BigInt olarak belirtilecektir.
   - Persistent = dosya değişiklikler için dinlenirken Node çalışmaya devam edip etmeyeceğini belirtir.
   - Interval = Değişiklikler için ne sıklıkta oylama yapılması gerektiği.
- listener function: her değişikliği yürütür.

fs, dosya değişikliklerini dinlemek için başka bir API sağlar, ancak daha hızlıdır ancak birden fazla platformda daha az tutarlıdır.


`watch` has three arguments:

- file
- options: aşağıdaki özelliklere sahip bir nesne:
   - Recursive = Değişikliklerin alt dizinlerde de izlenmesi gerekip gerekmediğini belirtin.
   - Persistent = dosya değişiklikler için dinlenirken Düğümün çalışmaya devam edip etmeyeceğini belirtir.
   - Encoding = Dosya adı için kodlamayı belirtin.
- listener function: her değişikliği yürütür. Frin watchFile'dan biraz farklıdır, bir `eventType` (değiştir veya yeniden adlandır) ve olayı tetikleyen dosya olan bir `trigger` alır.

```
const fs = require("fs");
const file = "./file.txt";
const moment = require("moment");

fs.watch(file, (eventType, filename) => {
  const time = moment().format("MMMM Do YYYY, h:mm:ss a");
  return console.log(`${filename} updated ${time}`);
});

```

## Creating TCP server and client communication

TCP = İletim Kontrol Protokolü    Transmission Control Protocol

Soket TCP - Node bir çekirdek modül `net` sağlar
Client:

```
const net = require("net");

const HOSTNAME = "localhost";
const PORT = 3000;

const socket = net.connect(PORT, HOSTNAME); // connect to server

socket.write("World"); // send message to server

socket.on("data", (data) => { // on server data received
  console.log(data.toString());
});
```

Server:

```
const net = require("net");

const HOSTNAME = "localhost";
const PORT = 3000;

net
  .createServer((socket) => { // create server
    console.log("Client connected.");

    socket.on("data", (name) => { // on client data received
      socket.write(`Hello ${name}!`); // send message to client
    });
  })
  .listen(PORT, HOSTNAME);
```

Dinleyebileceğimiz başka birçok olay var, örneğin: `close`, `connect`, `error`, `ready`, `drain`  (yazma arabelleği boş),`end`.

UDP = Kullanıcı Datagram Protokolü   User Datagram Protocol
UDP, TCP'den daha hızlı olan, sunucuyla bağlantı gerektirmeyen ancak teslimatı garanti edilmeyen bir protokoldür.
Video görüşmeleri, oyun oynama, akış gibi hızın daha önemli olduğu uygulamalarda kullanılır.

Soket UDP - Node bir çekirdek modül `dgram` sağlar

```
const dgram = require('dgram');
const socket = dgram.createSocket('udp6');
socket.bind(PORT);

```
