# Child Processes

Node is designed for building distributed applications with many nodes. Using multiple processes is the best way to scale a Node application.

We can spin a child process using Node’s `child_process` module and those child processes can:

- communicate with each other with a messaging system
- enables us to access Operating System functionalities by running any system command inside a child process.
- control that child process input stream and listen to its output stream.
- control the arguments to be passed to the underlying OS command
- control that command’s output. (For example, we can pipe the output of one command as the input to another (just like we do in Linux) as all inputs and outputs of these commands can be presented to us using Node streams).

The child_process module allows us to execute external non-Node applications and others (including Node applications) to use with our programs.
There are four different ways to create a child process in Node: `spawn()`, `fork()`, `exec()`, and `execFile()`.
All methods are asynchronous. The right method will depend on what you need:

![Choosing right method](08fig01_alt.jpg)

## spawn()

`spawn` launches a command in a new process and we can use it to pass that command any arguments.

The result of executing the spawn function is a `ChildProcess` instance, which implements the EventEmitter API, so we can register handlers for events on this child object directly.

```
const { spawn } = require("child_process");
const child = spawn("find", [".", "-type", "f"]);

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

child.on("exit", function(code, signal) {
  console.log(
    "child process exited with " + `code ${code} and signal ${signal}`
  );
});

```

First argument is the command, second argument is the arguments.

ChildProcess events:
`exit` = process exited
`disconnect` = the parent process manually calls the child.disconnect method.
`error` = if the process could not be spawned or killed.
`close` = event is emitted when the stdio streams of a child process get closed.
`message` = emitted when the child process uses the `process.send()` function to send messages. This is how parent/child processes can communicate with each other.

ChildProcess also has the standard three stdio streams `child.stdin`, `child.stdout`, and `child.stderr`.

We can listen to different events on those stdio streams that are attached to every child process, but unlike in a normal process though, in a child process the `stdout`/`stderr` streams are readable streams while the `stdin` stream is a writable one. This is basically the inverse of those types found in a main process.

```
child.stdout.on("data", data => {
  console.log(`child stdout:\n${data}`);
});

child.stderr.on("data", data => {
  console.error(`child stderr:\n${data}`);
});
```

if we get an error while executing the command, data event of stderr will triggered and child the error event handler will report exit code 1.

A child process stdin is a writable stream. We can use it to send a command some input for example using the pipe function:

```
const { spawn } = require("child_process");

const child = spawn("wc");

process.stdin.pipe(child.stdin);

child.stdout.on("data", data => {
  console.log(`child stdout:\n${data}`);
});
```

We can also pipe commands:

```
const { spawn } = require("child_process");

const find = spawn("find", [".", "-type", "f"]);
const wc = spawn("wc", ["-l"]);

find.stdout.pipe(wc.stdin);

wc.stdout.on("data", data => {
  console.log(`Number of files ${data}`);
});
```

## exec()

exec function is slightly less efficient than spawn because create a shell, so you can use all shell syntax.
Also it buffers the command's generated output and passes the whole output value to a callback function instead of using streams.

Previous example implemented with exec:

```
const { exec } = require("child_process");

exec("find . -type f | wc -l", (err, stdout, stderr) => {
  if (err) {
    console.error(`exec error: ${err}`);
    return;
  }

  console.log(`Number of files ${stdout}`);
});
```

The `exec` function buffers the output and passes it to the callback function (the second argument to exec) as the `stdout` argument there. This stdout argument is the command’s output that we want to print out.

You can use shell also with spawn:

```
const child = spawn("find . -type f | wc -l", {
  stdio: "inherit", //the child process inherits the main process stdin, stdout, and stderr
  shell: true,
  cwd: "[working directory]",
  env: { ANSWER: 42 } //child process only envs,
  detached: true, //run independently from parent process
});

child.unref(); //using unref, parent process can exit indipendently
```

And with this code we still get the advantage of the streaming of data that the spawn function gives us.

## execFile()

Execute a file without using a shell. It behaves exactly like the exec function, but does not use a shell, which makes it a bit more efficient.

## \*Sync Functions

The functions `spawn`, `exec`, and `execFile` from the child_process module also have synchronous blocking versions that will wait until the child process exits. Those synchronous versions are potentially useful when trying to simplify scripting tasks or any startup processing tasks, but they should be avoided otherwise.

## fork()

The fork function is a variation of the `spawn` function for spawning node processes. The biggest difference between spawn and fork is that a communication channel is established to the child process when using fork, so we can use the send function on the forked process along with the global process object itself to exchange messages between the parent and forked processes.

Parent process

```
const { fork } = require("child_process");

const forked = fork("child.js"); // execute file with 'node' command

forked.on("message", msg => {
  console.log("Message from child", msg);
});

forked.send({ hello: "world" });
```

Child process

```
process.on("message", msg => {
  console.log("Message from parent:", msg);
});

let counter = 0;

setInterval(() => {
  process.send({ counter: counter++ });
}, 1000);
```

# Child Processes

Node, çok sayıda düğüm içeren dağıtılmış uygulamalar oluşturmak için tasarlanmıştır. Birden çok işlemin kullanılması, bir Node uygulamasını ölçeklendirmenin en iyi yoludur.

Node'un "child_process" modülünü kullanarak bir alt süreci döndürebiliriz ve bu alt süreçler şunları yapabilir:

- bir mesajlaşma sistemi aracılığıyla birbirleriyle iletişim kurun
- Bir alt süreç içinde herhangi bir sistem komutunu çalıştırarak İşletim Sistemi işlevlerine erişmemizi sağlar.
- alt sürecin giriş akışını kontrol edin ve çıkış akışını dinleyin.
- temel işletim sistemi komutuna aktarılacak argümanları kontrol edin
- bu komutun çıktısını kontrol edin. (Örneğin, bir komutun çıktısını diğerine girdi olarak aktarabiliriz (tıpkı Linux'ta yaptığımız gibi), çünkü bu komutların tüm girdileri ve çıktıları bize Node akışları kullanılarak sunulabilir).

Child_process modülü, harici Node dışı uygulamaları ve diğerlerini (Node uygulamaları dahil) programlarımızla kullanmamızı sağlar.
Düğümde bir alt süreç oluşturmanın dört farklı yolu vardır: `spawn()`, `fork()`, `exec()` ve `execFile()`.
Tüm yöntemler eşzamansızdır. Doğru yöntem neye ihtiyacınız olduğuna bağlı olacaktır:



## spawn()

`spawn` yeni bir süreçte bir komut başlatır ve onu bu komutu herhangi bir argümanı iletmek için kullanabiliriz.

Spawn işlevini yürütmenin sonucu, EventEmitter API'sini uygulayan bir `ChildProcess` örneğidir, böylece bu alt nesnedeki olaylar için işleyicileri doğrudan kaydedebiliriz.

```
const { spawn } = require("child_process");
const child = spawn("find", [".", "-type", "f"]);

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

child.on("exit", function(code, signal) {
  console.log(
    "child process exited with " + `code ${code} and signal ${signal}`
  );
});

```

İlk argüman komut, ikinci argüman ise argümanlardır.

ChildProcess olayları:
`exit` = işlemden çıkıldı
`disconnect` = ana süreç child.disconnect yöntemini manuel olarak çağırır.
`error` = eğer süreç oluşturulamıyor veya sonlandırılamıyorsa.
`close` = Bir alt sürecin stdio akışları kapatıldığında olay yayılır.
`message` = alt süreç mesaj göndermek için `process.send()` fonksiyonunu kullandığında yayılır. Ebeveyn/çocuk süreçleri bu şekilde birbirleriyle iletişim kurabilir.

ChildProcess ayrıca standart üç stdio akışına sahiptir: `child.stdin`, `child.stdout` ve `child.stderr`.

Her alt sürece eklenen stdio akışlarındaki farklı olayları dinleyebiliriz, ancak normal bir süreçten farklı olarak, bir alt süreçte `stdout`/`stderr` akışları okunabilir akışlardır, `stdin` akışı ise bir akıştır. yazılabilir olan. Bu temelde bir ana süreçte bulunan türlerin tersidir.

```
child.stdout.on("data", data => {
  console.log(`child stdout:\n${data}`);
});

child.stderr.on("data", data => {
  console.error(`child stderr:\n${data}`);
});


```
Komutu çalıştırırken bir hata alırsak, stderr'in veri olayı tetiklenecek ve alt hata olayı işleyicisi çıkış kodu 1'i rapor edecektir.

Alt süreç stdin'i yazılabilir bir akıştır. Bunu, örneğin pipe işlevini kullanarak bir komuta bazı girdiler göndermek için kullanabiliriz:

```
const { spawn } = require("child_process");

const child = spawn("wc");

process.stdin.pipe(child.stdin);

child.stdout.on("data", data => {
  console.log(`child stdout:\n${data}`);
});
```

Ayrıca komutları da yönlendirebiliriz:

```
const { spawn } = require("child_process");

const find = spawn("find", [".", "-type", "f"]);
const wc = spawn("wc", ["-l"]);

find.stdout.pipe(wc.stdin);

wc.stdout.on("data", data => {
  console.log(`Number of files ${data}`);
});
```

## exec()

exec işlevi, bir kabuk oluşturduğundan, Spawn'dan biraz daha az verimlidir, böylece tüm kabuk sözdizimini kullanabilirsiniz.
Ayrıca, komutun oluşturulan çıktısını arabelleğe alır ve akış kullanmak yerine tüm çıktı değerini bir geri çağırma işlevine aktarır.
exec ile uygulanan önceki örnek:

```
const { exec } = require("child_process");

exec("find . -type f | wc -l", (err, stdout, stderr) => {
  if (err) {
    console.error(`exec error: ${err}`);
    return;
  }

  console.log(`Number of files ${stdout}`);
});

```
`exec` işlevi çıktıyı arabelleğe alır ve onu orada `stdout` argümanı olarak geri çağırma işlevine (exec'in ikinci argümanı) iletir. Bu stdout argümanı, yazdırmak istediğimiz komutun çıktısıdır.
shell Spawn ile de kullanabilirsiniz:

```
const child = spawn("find . -type f | wc -l", {
  stdio: "inherit", //the child process inherits the main process stdin, stdout, and stderr
  shell: true,
  cwd: "[working directory]",
  env: { ANSWER: 42 } //child process only envs,
  detached: true, //run independently from parent process
});

child.unref(); //using unref, parent process can exit indipendently
```

Ve bu kodla, Spawn fonksiyonunun bize sağladığı veri akışının avantajını hâlâ elde ediyoruz.

## execFile()

Bir dosyayı shell kullanmadan yürütün. Tam olarak exec işlevi gibi davranır, ancak shell kullanmaz, bu da onu biraz daha verimli kılar.

## \*Sync Functions

Child_process modülündeki `spawn`, `exec`, ve `execFile` işlevlerinin aynı zamanda alt süreç çıkıncaya kadar bekleyecek eşzamanlı engelleme sürümleri de vardır. Bu senkronize sürümler, komut dosyası oluşturma görevlerini veya herhangi bir başlangıç işleme görevini basitleştirmeye çalışırken potansiyel olarak faydalıdır, ancak aksi takdirde bunlardan kaçınılmalıdır.

## fork()

fork işlevi, node işlemlerinin doğuşu için `spawn` işlevinin bir çeşididir. Spawn ve fork arasındaki en büyük fark, fork kullanıldığında alt süreçle bir iletişim kanalının kurulmasıdır, böylece ana ve forked süreçler arasında mesaj alışverişi yapmak için global süreç nesnesinin kendisi ile birlikte forked süreçteki send işlevini kullanabiliriz.

Parent process

```
const { fork } = require("child_process");

const forked = fork("child.js"); // execute file with 'node' command

forked.on("message", msg => {
  console.log("Message from child", msg);
});

forked.send({ hello: "world" });
```

Child process

```
process.on("message", msg => {
  console.log("Message from parent:", msg);
});

let counter = 0;

setInterval(() => {
  process.send({ counter: counter++ });
}, 1000);
```
