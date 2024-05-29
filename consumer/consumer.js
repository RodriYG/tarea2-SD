const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Kafka } = require("kafkajs");
const pg = require('pg');

const pool = new pg.Pool({
    user: 'user',
    host: 'postgres',
    database: 'tarea2',
    password: 'user',
    port: 5432
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

const kafka = new Kafka({
    clientId: "my-app",
    brokers: ["kafka:9092"]
});

const main = async () => {
    const consumer = kafka.consumer({ groupId: "updates" });
    await consumer.connect();
    await consumer.subscribe({ topic: "delivery", fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                value: message.value.toString(),
            })
        }
    });
}

main();

app.listen(3001, () => {
	console.log("\nServer PRODUCER corriendo en puerto: 3001\n");
});