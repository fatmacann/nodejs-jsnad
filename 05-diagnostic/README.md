# Diagnostics

## Debugging Node.js

### Diagnosing issues with Chrome DevTools

- When launching node add the flag `--inspect`.
- In Chrome DevTools, go to link `chrome://inspect/#devices`
- You should see your entrypoint file. Click the relative link `inspect`
- In console, it will show a log with a link to your entrypoint file. Click on it, you'll see the source code of the file
- Add a breakpoint and navigate to the url

The ability to debug come from V8 Javascript Engine. Using the flag, V8 inspector will open a port that accept WebSocket connections, for listen for a debugging client.
Using the protocol `devtools://` Chrome will open a Chrome DevTools interface.
When we set a breakpoint and it's encountered, the event loop will be paused and V8 inspector will send a WebSocket message with the current state.
If we step into, a command will be send to V8 inspector that will temporarily resume the event loop execution.

You can use command line using the command `node inspect server.js`.
Debug mode will pause to the first line. You will see a `debug> ` mode.
You can type:

- help: for the list of commands
- line(x): show following x lines
- setBreakpoint(x) (or sb(x)): set a breakpoint at line x
- cont: continue after breakpoint
- step: step into function
- out: step out function

## Logging with Node.js (using pino)

- add dependencies `pino` and `express-pino-logger`
- after the PORT assignment, register pino:

```
const pino = require('pino')();
const logger = require('express-pino-logger') ({
    instance:pino
});
app.use(pino);
```

`express-pino-logger` is a middleware that enables Pino logging for Express web server. They are imported indipendentely so that we can interact with pino logger both directly and via our middleware.
Pino interface is based on Log4j. It allows to group your error message by level (trace, debug, info, error, warn and fatal).
This middleware adds a log object in the incoming request object. Then you can log calling `re.log.info()` (for an info log); it will also add a log for every request completed.

### Pino and web frameworks

It's possible to integrate Pino with other popular web frameworks:

- `express-pino-logger` = Express middleware for Pino
- `hapi-pino` = Hapi plugin for Pino
- `koa-pino` = Koa middleware for Pino
- `restify-pino` = Restify middleware for Pino

In Fastify, Pino is the built in logger, you just need to configure during require:

```
const fastify = require('fastify')({
    logger: true,
})
```

## Logging with Morgan

Morgan is an HTTP request logger middleware for Node.js, only for HTTP request and not for general purposes.
It's generally used with express. Using `express-generator` will create a skeleton that include already Morgan.

```
var logger = require('morgan');
app.use(logger('dev'));
```

with the parameter we can set the logging format.

## Logging with Winston

Winston expose an interface that is also similar to log4j interface. The difference between Pino and Winston is that Winston provide a large number of configuration options, and it includes log transformation and log rotations.

```
var winston = require('winston');
var expressWinston = require('express-winston'); //winston middleware
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console({
            json: true //expose log in json format
        })
    ]
}));
```

## Enabling debug logs

`debug` is a small library utility used by Express,Koa and Mocha.
To enable, start the server with the following command:

`DEBUG=* node server.js`

you can also filter by log type specifing the value to DEBUG=.
For every request you can see in console the complete list of sub actions processed.

DEBUG is an environment variable that will be used by the internal module `debug` for print instructions.
You can add also custom debug message like so:

```
const debug = require('debug')('my-server'); //message will be prepended with 'my-server'
...

debug('My message');

```

## Enabling Node.js core debug logs

You can enable debug on internal Node.js setting the environment variable NODE_DEBUG to an internal flag such as :

- `timer` = timer core debug logs
- `http` = log for internal http module

and many other internal Node modules (`https`, `http2`,`cluster`,`module`,`worker`,`tls`...)
You can set multiple flags separating by commas.

## Increasing stack trace size

By default stack trace size it's limited to 10 lines. You can increase the size by setting using the flag:
`node --stack-trace-limit=20`
It's also possible to set by code with:
`Error.stackTraceLimit=20`
`Error.stackTraceLimit=Infinity` for no limit to stack trace.

Starting from Node 12, you can log also asynchronous stack trace.

## Creating diagnostic reports

You can create diagnostic reports containg data relative to specific event, that can help you diagnose problems in applications.
To enable it, add use this command to launch node:
`node --report-uncaught-exception server.js`

when an uncaught exception occur, it will be generated a json file in `report` folder with error details.
All flag options:

- `--report-uncaught-exception` = it is triggered a crash when a uncaught exception occur.
- `--report-on-signal` = when receiving a specific signal.
- `--report-on-fatalerror` = on a fatal error, such as an out of memory.

It is also possible to generate report from within your application using:
`process.report.writeReport()`

You can setup folder and report name with:
`process.report.directory (--report-directory)`
`process.report.filename (--report-filename)`


### tr

# Diagnostics

## Debugging Node.js

### Diagnosing issues with Chrome DevTools

- node başlatırken `--inspect` bayrağını ekleyin.
- Chrome DevTools'ta `chrome://inspect/#devices` bağlantısına gidin
- Giriş noktası dosyanızı görmelisiniz. İlgili `inspect` bağlantısını tıklayın
- Konsolda, giriş noktası dosyanıza bağlantı içeren bir günlük gösterecektir. Üzerine tıklayın, dosyanın kaynak kodunu göreceksiniz
- Bir breakpoint ekleyin ve URL'ye gidin

Hata ayıklama yeteneği(debug) V8 Javascript Motorundan gelir. Bayrağı kullanarak V8 denetçisi, hata ayıklama istemcisini dinlemek için WebSocket bağlantılarını kabul eden bir bağlantı noktası açacaktır.
`devtools://` protokolünü kullanarak Chrome, bir Chrome DevTools arayüzü açacaktır.
Bir breakpoint belirlediğimizde ve bununla karşılaşıldığında, olay döngüsü duraklatılacak ve V8 denetçisi mevcut durumu içeren bir WebSocket mesajı gönderecektir.
Eğer devreye girersek, V8 denetçisine olay döngüsünün yürütülmesini geçici olarak sürdürecek bir komut gönderilecektir.

`node inspect server.js`. komutunu kullanarak komut satırını kullanabilirsiniz.
Hata ayıklama modu ilk satıra kadar duraklayacaktır. Bir `debug> ` modu göreceksiniz.
Yazabilirsin:

- help: komutların listesi için
- line(x): aşağıdaki x satırları göster
- setBreakpoint(x) (veya sb(x)): x satırına bir kesme noktası ayarlayın
- cont: kesme noktasından sonra devam et
- step: işleve adım atın
- out: dışarı çıkma işlevi

## Logging with Node.js (using pino)

- `pino` ve `express-pino-logger` bağımlılıklarını ekleyin
- PORT atamasından sonra pino'yu kaydedin:

```
const pino = require('pino')();
const logger = require('express-pino-logger') ({
    instance:pino
});
app.use(pino);
```

`express-pino-logger`, Express web sunucusu için Pino günlüğünü etkinleştiren bir ara yazılımdır. Pino logger ile hem doğrudan hem de ara yazılımımız aracılığıyla etkileşim kurabilmemiz için bağımsız olarak içe aktarılırlar.
Pino arayüzü Log4j'ye dayanmaktadır. Hata mesajlarınızı seviyeye göre (izleme, hata ayıklama, bilgi, hata, uyarı ve ölümcül(trace, debug, info, error, warn and fatal)) gruplandırmanıza olanak tanır.
Bu ara yazılım, gelen istek nesnesine bir günlük nesnesi ekler. Daha sonra `re.log.info()` (bilgi günlüğü için) çağrısını kaydedebilirsiniz; ayrıca tamamlanan her istek için bir günlük ekleyecektir.

### Pino and web frameworks

Pino'yu diğer popüler web frameworks entegre etmek mümkündür:

- `express-pino-logger` = Pino için ekspres ara katman yazılımı
- `hapi-pino` = Pino için Hapi eklentisi
- `koa-pino` = Pino için Koa ara yazılımı
- `restify-pino` = Pino için ara yazılımı yeniden düzenle

Fastify'da Pino yerleşik kaydedicidir, yalnızca aşağıdaki gereksinimler sırasında yapılandırmanız gerekir:

```
const fastify = require('fastify')({
    logger: true,
})
```

## Logging with Morgan

Morgan, Node.js için yalnızca HTTP isteğine yönelik olan ve genel amaçlara yönelik olmayan bir HTTP istek kaydedici ara yazılımıdır.
Genellikle express ile kullanılır. `express-generator`ı kullanmak, halihazırda Morgan'ı içeren bir iskelet yaratacaktır.

```
var logger = require('morgan');
app.use(logger('dev'));
```

parametresi ile kayıt formatını ayarlayabiliriz.

## Logging with Winston

Winston, log4j arayüzüne benzer bir arayüz ortaya çıkarıyor. Pino ve Winston arasındaki fark, Winston'ın çok sayıda yapılandırma seçeneği sunması ve günlük dönüştürme ve günlük döndürmeleri içermesidir.

```
var winston = require('winston');
var expressWinston = require('express-winston'); //winston middleware
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console({
            json: true //expose log in json format
        })
    ]
}));
```

## Enabling debug logs

`debug` Express, Koa ve Mocha tarafından kullanılan küçük bir kütüphane aracıdır.
Etkinleştirmek için sunucuyu aşağıdaki komutla başlatın:

`DEBUG=* node server.js`

değeri DEBUG= olarak belirterek günlük türüne göre de filtreleyebilirsiniz.
Her istek için işlenen alt eylemlerin tam listesini konsolda görebilirsiniz.

DEBUG, yazdırma talimatları için dahili `debug` modülü tarafından kullanılacak bir ortam değişkenidir.
Ayrıca aşağıdaki gibi özel hata ayıklama mesajı da ekleyebilirsiniz:

```
const debug = require('debug')('my-server'); //message will be prepended with 'my-server'
...

debug('My message');

```

## Enabling Node.js core debug logs

NODE_DEBUG ortam değişkenini aşağıdaki gibi bir dahili bayrağa ayarlayarak dahili Node.js'de hata ayıklamayı etkinleştirebilirsiniz:

- `timer` = zamanlayıcı çekirdeği hata ayıklama günlükleri  timer core debug logs
- `http` = dahili http modülü için günlük  log for internal http module

ve diğer birçok dahili Node modülü (`https`, `http2`,`cluster`,`module`,`worker`,`tls`...)
Virgülle ayırarak birden fazla bayrak ayarlayabilirsiniz.

## Increasing stack trace size

Varsayılan olarak yığın izleme boyutu 10 satırla sınırlıdır. Bayrağı kullanarak ayarlayarak boyutu artırabilirsiniz:
`node --stack-trace-limit=20`
Aşağıdakilerle koda göre ayarlamak da mümkündür:
`Error.stackTraceLimit=20`
`Error.stackTraceLimit=Infinity` Yığın izlemede sınır olmaması için 

Node 12'den başlayarak eşzamansız yığın izlemeyi de günlüğe kaydedebilirsiniz.

## Creating diagnostic reports

Uygulamalardaki sorunları teşhis etmenize yardımcı olabilecek, belirli bir olaya ilişkin verileri içeren teşhis raporları oluşturabilirsiniz.
Etkinleştirmek için, node başlatmak üzere bu komutu kullanın:
`node --report-uncaught-exception server.js`

Yakalanmayan bir istisna oluştuğunda, `report` klasöründe hata ayrıntılarını içeren bir json dosyası oluşturulacaktır.
Tüm bayrak seçenekleri:

- `--report-uncaught-exception` = yakalanmamış bir istisna meydana geldiğinde bir çökmeyi tetikler.
- `--report-on-signal` = belirli bir sinyal alınırken.
- `--report-on-fatalerror` = bellek yetersizliği gibi önemli bir hata durumunda.

Aşağıdakileri kullanarak uygulamanızın içinden rapor oluşturmak da mümkündür:
`process.report.writeReport()`

Klasörü ve rapor adını aşağıdakilerle ayarlayabilirsiniz:
`process.report.directory (--report-directory)`
`process.report.filename (--report-filename)`
