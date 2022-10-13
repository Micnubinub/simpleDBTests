const Surreal = require('surrealdb.js').default;
const db = new Surreal('http://127.0.0.1:8000/rpc');
let idsToBeRead = [];
const iterations = 50_000;
console.time("start")
const runTasks = async () => {
    await db.signin({
        user: 'root',
        pass: 'root',
    });

    // Select a specific namespace / database
    await db.use('ndis', 'ndis');

    for (let i = 0; i < iterations; i++) {
        let created = await db.create("log", {
            log: {a: i},
        });

        idsToBeRead.push(created.id)
    }
    //
    for (let i = 0; i < idsToBeRead.length; i++) {
        let log = await db.select(idsToBeRead[i]);
    }

    for (let i = 0; i < iterations; i++) {
        let created = await db.create("log", {
            log: {a: i * Math.random()},
        });
    }
}

runTasks().then(r => console.timeEnd("start")).catch(e => console.log(e));







