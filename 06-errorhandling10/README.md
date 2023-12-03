# Error Handling

Errors in Node.js are handled through exceptions.

An exception is created using `throw` an Error object.
You can technically throw things that are not Errors, but this should be avoided.

```
throw new Error('my error');
```

```
class MyError extends Error {

}
throw new MyError();
```

An exception handler is a `try`/`catch` statement.
Any exception raised in the lines of code included in the try block is handled in the corresponding catch block.

Synchronous API will use `throw` to report errors.
Errors that occur within Asynchronous APIs may be reported in multiple ways:

- Most asynchronous methods that accept a callback function will accept an `Error` object passed as the first argument (error-first callbacks) to that function. If that object is not null an error occurred.
- When an asynchronous method is called on an object that is an `EventEmitter`, errors can be routed to that object's 'error' event. If the error event is not provided, Node.js process will report an uncaught exception.

## Error classes

Class Error

Properties:
`stack`

```
[Error class]: [Error message]
    [Stack trace]
```

Stack traces. Extend only to either: - (a) the beginning of synchronous code execution, or - (b) the number of frames given by the property Error.stackTraceLimit, whichever is smaller.

`Error.captureStackTrace(targetObject[, constructorOpt])`
Creates a .stack property on targetObject, which when accessed returns a string representing the location in the code at which Error.captureStackTrace() was called.

`code`
String label that identifies the kind of error. It is the most stable way to identify an error.

Class AssertionError => Indicates the failure of an assertion

Class RangeError => Arguments were not within the set or range of acceptable values

Class ReferenceError => Access a variable that is not defined

Class SyntaxError => Program is not valid JavaScript

Class SystemError => An application violates an operating system constraint
EACCES (Permission denied)
EADDRINUSE (Address already in use)
ECONNREFUSED (Connection refused)
ECONNRESET (Connection reset by peer)
EEXIST (File exists)
EISDIR (Is a directory)
EMFILE (Too many open files in system)
ENOENT (No such file or directory)
ENOTDIR (Not a directory)
ENOTEMPTY (Directory not empty)
ENOTFOUND (DNS lookup failed)
EPERM (Operation not permitted)
EPIPE (Broken pipe)
ETIMEDOUT (Operation timed out)

Class TypeError => Indicates that a provided argument is not an allowable type.

## Catching uncaught exceptions

If there is an uncaught exception, the program will crash.
Uncaught exceptions cannot be intercepted using try…catch.
To solve it:

```
process.on('uncaughtException', err => {
  console.error('There was an uncaught error', err)
  process.exit(1) //mandatory (as per the Node.js docs)
})
```

## Exception with Promises

With promises you can handle errors at the end of the chain:

```
doSomething1()
  .then(doSomething2)
  .then(doSomething3)
  .catch(err => console.error(err))
```

To understand in which function there is an error, you can catch the error and rethrow in each function:

```
const doSomething1 = () => {
  //...
  try {
    //...
  } catch (err) {
    //... handle it locally
    throw new Error(err.message)
  }
  //...
}
```

Or creating catching the error in each `then()`

```
doSomething1()
  .then(() => {
    return doSomething2().catch(err => {
      //handle error
      throw err //break the chain!
    })
  })
  .then(() => {
    return doSomething3().catch(err => {
      //handle error
      throw err //break the chain!
    })
  })
  .catch(err => console.error(err))
```

## Error handling with async/await

With async await you need again to use try/catch:

```
async function someFunction() {
  try {
    await someOtherFunction()
  } catch (err) {
    console.error(err.message)
  }
}
```

NB: You can't handle asynchronous error invoking the callback function and passing the error.

```
const func = () => {
  return new Promise((resolve, reject) => {
    setImmediate(() => {
      throw new Error('foo');
    });
  });
};


const main = async () => {
  try {
    await func();
  } catch (ex) {
    console.log('will not execute');
  }
};

main();
```

This will generate an unhandle error. In this case you have to handle with the Promise catch.

```
const main = () => {
  func().catch((ex) => console.log('will execute'))
};

```

## Operational Errors and Programmer errors

Operational errors = run-time problems experienced by correctly-written programs.
Programmer errors = bugs in program.

### Handling operational errors

There isn't a unique way to manage these kind of errors, there are unhandle errors and you need to find the cause and handle it.

You might do:

- Deal with the failure directly, recover in case of errors
- Propagate the failure to your client
- Retry the operation
- Just log and skip

### Handling programmer errors

The best way to recover from programmer errors is to crash immediately. You should run your programs using a restarter that will automatically restart the program in the event of a crash.


### tr
# Error Handling

Node.js'deki hatalar istisnalar aracılığıyla işlenir.

Bir Error nesnesinin `throw` kullanılarak bir istisna oluşturulur.
Teknik olarak Hata olmayan şeyleri atabilirsiniz ancak bundan kaçınılmalıdır.

```
throw new Error('my error');
```

```
class MyError extends Error {

}
throw new MyError();
```

Bir istisna işleyicisi bir `try`/`catch` ifadesidir.
Try bloğundaki kod satırlarında ortaya çıkan herhangi bir istisna, karşılık gelen catch bloğunda işlenir.

Senkronize API, hataları bildirmek için `throw` kullanır.
Eşzamansız API'lerde meydana gelen hatalar birden çok yolla bildirilebilir:

- Bir geri çağırma işlevini kabul eden eşzamansız yöntemlerin çoğu, o işleve ilk argüman (hata ilk geri çağırmalar) olarak iletilen bir `Error` nesnesini kabul eder. Bu nesne boş değilse bir hata oluştu.
- `EventEmitter` olan bir nesne üzerinde eşzamansız bir yöntem çağrıldığında, hatalar o nesnenin 'error' olayına yönlendirilebilir. Error olayı sağlanmazsa Node.js işlemi yakalanmamış bir istisna raporlayacaktır.

## Error classes

Class Error

Properties:
`stack`

```
[Error class]: [Error message]
    [Stack trace]
```

Stack izleri. Yalnızca şunlardan birine genişletin: - (a) eşzamanlı kod yürütmenin başlangıcı veya - (b) Error.stackTraceLimit özelliği tarafından verilen frame sayısı (hangisi daha küçükse).

`Error.captureStackTrace(targetObject[, constructorOpt])`
targetObject üzerinde, erişildiğinde Error.captureStackTrace() öğesinin çağrıldığı koddaki konumu temsil eden bir dize döndüren bir .stack özelliği oluşturur.

`code`

Hatanın türünü tanımlayan dize etiketi. Bir hatayı tanımlamanın en kararlı yoludur.

Class AssertionError => Bir iddianın başarısızlığını gösterir

Class RangeError => Bağımsız değişkenler kabul edilebilir değerler kümesi veya aralığında değildi

Class ReferenceError => Tanımlanmamış bir değişkene erişim

Class SyntaxError => Program geçerli bir JavaScript değil

Class SystemError => Bir uygulama, işletim sistemi kısıtlamasını ihlal ediyor
EACCES (Permission denied)
EADDRINUSE (Address already in use)
ECONNREFUSED (Connection refused)
ECONNRESET (Connection reset by peer)
EEXIST (File exists)
EISDIR (Is a directory)
EMFILE (Too many open files in system)
ENOENT (No such file or directory)
ENOTDIR (Not a directory)
ENOTEMPTY (Directory not empty)
ENOTFOUND (DNS lookup failed)
EPERM (Operation not permitted)
EPIPE (Broken pipe)
ETIMEDOUT (Operation timed out)

Class TypeError => Indicates that a provided argument is not an allowable type.

## Catching uncaught exceptions

Yakalanmayan bir istisna varsa program çökecektir.
Yakalanmayan istisnalar try…catch kullanılarak durdurulamaz.
Bunu çözmek için:
```
process.on('uncaughtException', err => {
  console.error('There was an uncaught error', err)
  process.exit(1) //mandatory (as per the Node.js docs)
})
```

## Exception with Promises

promisesle chain sonundaki hataları halledebilirsiniz:
```
doSomething1()
  .then(doSomething2)
  .then(doSomething3)
  .catch(err => console.error(err))
```

Hangi fonksiyonda hata olduğunu anlamak için hatayı yakalayabilir ve her fonksiyonda yeniden işlem yapabilirsiniz:

```
const doSomething1 = () => {
  //...
  try {
    //...
  } catch (err) {
    //... handle it locally
    throw new Error(err.message)
  }
  //...
}
```
Veya her `then()`da hatayı yakalamayı oluşturmak

```
doSomething1()
  .then(() => {
    return doSomething2().catch(err => {
      //handle error
      throw err //break the chain!
    })
  })
  .then(() => {
    return doSomething3().catch(err => {
      //handle error
      throw err //break the chain!
    })
  })
  .catch(err => console.error(err))
```

## Error handling with async/await

With async await you need again to use try/catch:

```
async function someFunction() {
  try {
    await someOtherFunction()
  } catch (err) {
    console.error(err.message)
  }
}
```

Not: callback işlevini çağırarak ve hatayı ileterek asynchronous error işleyemezsiniz.

```
const func = () => {
  return new Promise((resolve, reject) => {
    setImmediate(() => {
      throw new Error('foo');
    });
  });
};


const main = async () => {
  try {
    await func();
  } catch (ex) {
    console.log('will not execute');
  }
};

main();
```

Bu unhandle error üretecektir. Bu durumda Promise yakalamasıyla ilgilenmeniz gerekir.
```
const main = () => {
  func().catch((ex) => console.log('will execute'))
};

```

## Operational Errors and Programmer errors

Operational errors = doğru yazılmış programların yaşadığı çalışma zamanı sorunları.
Programmer errors = programdaki hatalar.

### Handling operational errors

Bu tür hataları yönetmenin benzersiz bir yolu yoktur, düzeltilemeyen hatalar vardır ve nedenini bulup çözmeniz gerekir.

Şunları yapabilirsiniz:

- Arızayla doğrudan ilgilenin, hata durumunda durumu düzeltin
- Başarısızlığı müşterinize yayın
- İşlemi yeniden deneyin
- Sadece giriş yapın ve atlayın

### Handling programmer errors

Programcı hatalarından kurtulmanın en iyi yolu, hemen çökmektir. Programlarınızı, bir çökme durumunda programı otomatik olarak yeniden başlatacak bir yeniden başlatıcı kullanarak çalıştırmalısınız.
