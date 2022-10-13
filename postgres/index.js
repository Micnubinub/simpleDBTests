//todo "postgresql://postgres:password@ip:port/db?connection_limit=5"
const sql = require('postgres')("postgresql://postgres:development-password@localhost:12340/ndis", {
    ssl: false,      // true, prefer, require, tls.connect options
    max: 5,         // Max number of connections
    idle_timeout: 10,          // Idle connection timeout in seconds
    connect_timeout: 4,         // Connect timeout in seconds
    no_prepare: false,
});

let idsToBeRead = [];
const iterations = 50_000;
console.time("start")
const runTasks = async () => {
    for (let i = 0; i < iterations; i++) {
        await sql`insert into logs (log)
                  VALUES (${sql.json({a: i})})
                  returning id;`.then((resp) => {
            idsToBeRead.push(resp[0].id)

        }).catch(err => {
            console.log(err);
        });
    }

    for (let i = 0; i < idsToBeRead.length; i++) {
        await sql`select *
                  from logs
                  where id = ${idsToBeRead[i]};`.then((resp) => {

        }).catch(err => {
            console.log(err);
        });
    }

    for (let i = 0; i < iterations; i++) {
        await sql`insert into logs (log)
                  VALUES (${sql.json({a: i})})
                  returning id;`.then((resp) => {
        }).catch(err => {
            console.log(err);
        });
    }
}

runTasks().then(r => console.timeEnd("start")).catch(e => console.log(e));







