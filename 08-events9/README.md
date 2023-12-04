# Events

## The EventEmitter Module

The EventEmitter is a Node.js built-in module that facilitates communication between objects in Node. It allows to create, fire, and listen for custom events.
Emitter objects emit named events that cause previously registered listeners to be called.
EventEmitter objects emit events and expose an eventEmitter.on() function that allows one or more functions to be attached to named events emitted by the object.
When the EventEmitter object emits an event, all of the functions attached to that specific event are called synchronously

```
class MyEmitter extends EventEmitter {

}

const myEmitter = new MyEmitter();
myEmitter.emit('something-happened');
```

Example:

```
const EventEmitter = require('events');

class WithLog extends EventEmitter {
  execute(taskFunc) {
    console.log('Before executing');
    this.emit('begin');
    taskFunc();
    this.emit('end');
    console.log('After executing');
  }
}

const withLog = new WithLog();

withLog.on('begin', () => console.log('About to execute'));
withLog.on('end', () => console.log('Done with execute'));

withLog.execute(() => console.log('*** Executing task ***'));
```

this will result in:

```
Before executing
About to execute
*** Executing task ***
Done with execute
After executing
```

### Some common properties and methods of the events module

| EventEmitter methods |	Description |
| addListener(event, listener) | Adds a listener to the end of the listeners array for the specified event. No checks are made to see if the listener has already been added. |
| on(event, listener) |	It can also be called as an alias of emitter.addListener() |
| once(event, listener) |	Adds a one-time listener for the event. This listener is invoked only the next time the event is fired, after which it is removed. |
| emit(event, [arg1], [arg2], [...]) | Raise the specified events with the supplied arguments. |
| removeListener(event, listener) | Removes a listener from the listener array for the specified event. Caution: changes array indices in the listener array behind the listener. |
| removeAllListeners([event]) | Removes all listeners, or those of the specified event. |

### EventEmitter and asynchronous events

Rewrite the same example for asynchronous (callback-style) functions:

```
const fs = require('fs');
const EventEmitter = require('events');

class WithTime extends EventEmitter {
  execute(asyncFunc, ...args) {
    this.emit('begin');
    console.time('execute');
    asyncFunc(...args, (err, data) => {
      if (err) {
        return this.emit('error', err);
      }

      this.emit('data', data);
      console.timeEnd('execute');
      this.emit('end');
    });
  }
}

const withTime = new WithTime();

withTime.on('begin', () => console.log('About to execute'));
withTime.on('end', () => console.log('Done with execute'));

withTime.execute(fs.readFile, __filename);
```

Using async functions with event handlers is problematic, because it can lead to an unhandled rejection in case of a thrown exception. Setting `events.captureRejections = true` will change the default for all new instances of EventEmitter.

```
const events = require('events');
events.captureRejections = true;
const ee1 = new events.EventEmitter();
ee1.on('something', async (value) => {
  throw new Error('kaboom');
});

ee1.on('error', console.log);
```

### Events Arguments and Errors

We can use as many arguments as we need after the named event, and all these arguments will be available inside the listener functions we register for these named events.

```
this.emit('data', data);

emitter.on('data', (data) => {
  // do something with data
});
```

The `error` event is usually a special one. If we don’t handle the `error` event with a listener, the node process will actually exit.
You have to add a listener to error event to handle the error.
It is possible to monitor `error` events without consuming the emitted error by installing a listener using the symbol `events.errorMonitor`.
The other way to handle exceptions from emitted errors is to register a listener for the global uncaughtException process event. However, catching errors globally with that event is a bad idea.

The `EventEmitter` module exposes a `once` method. This method signals to invoke the listener just once, not every time it happens.

If we register multiple listeners for the same event, the invocation of those listeners will be in order. The first listener that we register is the first listener that gets invoked. But if you need to define a new listener, but have that listener invoked first, you can use the `prependListener` method:

```
myEmitter.on('data', (data) => {
  console.log('listener 1');
});

myEmitter.on('data', (data) => {
  console.log('listener 2');
});

myEmitter.prependListener('data', (data) => {
  console.log('listener 3');
});

withTime.execute(fs.readFile, __filename);
```

In this example, the output will be:

```
listener 3
listener 1
listener 2
```

If you need to remove a listener, you can use the `removeListener` method.


### tr

# Events

## The EventEmitter Module

EventEmitter, Node.js'deki nesneler arasındaki iletişimi kolaylaştıran yerleşik bir Node.js modülüdür. Özel etkinlikler oluşturmanıza, başlatmanıza ve dinlemenize olanak tanır.
Verici nesneler, önceden kayıtlı dinleyicilerin çağrılmasına neden olan adlandırılmış olaylar yayar.
EventEmitter nesneleri olaylar yayar ve nesne tarafından yayılan adlandırılmış olaylara bir veya daha fazla işlevin eklenmesine olanak tanıyan bir eventEmitter.on() işlevini kullanıma sunar.
EventEmitter nesnesi bir olay yayınladığında, o belirli olaya eklenen tüm işlevler eşzamanlı olarak çağrılır.

```
class MyEmitter extends EventEmitter {

}

const myEmitter = new MyEmitter();
myEmitter.emit('something-happened');
```

Example:

```
const EventEmitter = require('events');

class WithLog extends EventEmitter {
  execute(taskFunc) {
    console.log('Before executing');
    this.emit('begin');
    taskFunc();
    this.emit('end');
    console.log('After executing');
  }
}

const withLog = new WithLog();

withLog.on('begin', () => console.log('About to execute'));
withLog.on('end', () => console.log('Done with execute'));

withLog.execute(() => console.log('*** Executing task ***'));
```

this will result in:

```
Before executing
About to execute
*** Executing task ***
Done with execute
After executing
```

### Some common properties and methods of the events module

| EventEmitter methods | Description |
| addListener(event, listener) | Belirtilen olay için dinleyici dizisinin sonuna bir dinleyici ekler. Dinleyicinin daha önce eklenip eklenmediğine dair herhangi bir kontrol yapılmaz. |
| on(event, listener) | Ayrıca emitter.addListener() | takma adı olarak da adlandırılabilir.
| once(event, listener) | Etkinliğe tek seferlik bir dinleyici ekler. Bu dinleyici yalnızca olayın bir sonraki tetiklenişinde çağrılır ve ardından kaldırılır. |
| emit(event, [arg1], [arg2], [...]) | Belirtilen olayları sağlanan bağımsız değişkenlerle yükseltin. |
| RemoveListener(event, listener) | Belirtilen olay için dinleyici dizisinden bir dinleyiciyi kaldırır. Dikkat: dinleyicinin arkasındaki dinleyici dizisindeki dizi indekslerini değiştirir. |
| removeAllListeners([event]) | Tüm dinleyicileri veya belirtilen olayın dinleyicilerini kaldırır. |

### EventEmitter and asynchronous events

Eşzamansız (geri arama stili) işlevler için aynı örneği yeniden yazın:

```
const fs = require('fs');
const EventEmitter = require('events');

class WithTime extends EventEmitter {
  execute(asyncFunc, ...args) {
    this.emit('begin');
    console.time('execute');
    asyncFunc(...args, (err, data) => {
      if (err) {
        return this.emit('error', err);
      }

      this.emit('data', data);
      console.timeEnd('execute');
      this.emit('end');
    });
  }
}

const withTime = new WithTime();

withTime.on('begin', () => console.log('About to execute'));
withTime.on('end', () => console.log('Done with execute'));

withTime.execute(fs.readFile, __filename);
```

async işlevlerin olay işleyicileriyle kullanılması sorunludur çünkü atılan bir özel durum durumunda işlenmeyen bir reddetmeye yol açabilir. `events.captureRejections = true` ayarının yapılması, tüm yeni EventEmitter örnekleri için varsayılanı değiştirecektir.

```
const events = require('events');
events.captureRejections = true;
const ee1 = new events.EventEmitter();
ee1.on('something', async (value) => {
  throw new Error('kaboom');
});

ee1.on('error', console.log);
```

### Events Arguments and Errors

Adlandırılmış olaydan sonra ihtiyaç duyduğumuz kadar argüman kullanabiliriz ve bu argümanların tümü, bu adlandırılmış olaylar için kaydettiğimiz listener fonksiyonların içinde bulunacaktır.

```
this.emit('data', data);

emitter.on('data', (data) => {
  // do something with data
});
```

`error` olayı genellikle özel bir olaydır. Eğer `error` olayını bir dinleyici ile ele almazsak, node prosesinden gerçekten çıkılacaktır.
Hatayı işlemek için error olayına bir dinleyici eklemeniz gerekir.
`events.errorMonitor` sembolünü kullanarak bir dinleyici yükleyerek, yayılan hatayı tüketmeden `error` olaylarını izlemek mümkündür.
Yayılan hatalardan kaynaklanan istisnaları ele almanın diğer yolu, global uncaughtException süreç olayı için bir dinleyici kaydetmektir. Ancak bu olayla ilgili hataları küresel olarak yakalamak kötü bir fikirdir.

`EventEmitter` modülü bir `once` yöntemini ortaya çıkarır. Bu yöntem, dinleyiciyi her seferinde değil, yalnızca bir kez çağırma sinyali verir.

Aynı olay için birden fazla dinleyici kaydedersek bu dinleyicilerin çağrılması sıralı olacaktır. Kaydettiğimiz ilk dinleyici çağrılan ilk dinleyicidir. Ancak yeni bir dinleyici tanımlamanız gerekiyorsa ve önce bu dinleyicinin çağrılmasını istiyorsanız `prependListener` yöntemini kullanabilirsiniz:

```
myEmitter.on('data', (data) => {
  console.log('listener 1');
});

myEmitter.on('data', (data) => {
  console.log('listener 2');
});

myEmitter.prependListener('data', (data) => {
  console.log('listener 3');
});

withTime.execute(fs.readFile, __filename);
```

In this example, the output will be:

```
listener 3
listener 1
listener 2
```

Bir dinleyiciyi kaldırmanız gerekiyorsa `removeListener` yöntemini kullanabilirsiniz.