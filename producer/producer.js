const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Kafka, logLevel } = require("kafkajs");
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
    brokers: ["kafka:9092"],
    logLevel: logLevel.NOTHING
});

app.post('/new_order', async (req, res) => {
    if (!req.body.name || !req.body.price) {
        console.log("body vacio")
        return res.status(400).json({ message: ".body vacio" })
    }

    const status = "recibido";
    await pool.query('INSERT INTO products (product_name, price, status) VALUES ($1, $2, $3)', [req.body.name, req.body.price, status]);
    const id = (await pool.query('SELECT id FROM products WHERE product_name = $1 AND price = $2', [req.body.name, req.body.price])).rows[0].id;

    const producer = kafka.producer();
    await producer.connect();

    await producer.send({
        topic: "delivery",
        messages: [
            { value: JSON.stringify({ id, ...req.body, status })}
        ]
    });

    await producer.disconnect();
    console.log(req.body)
    res.status(200).json({ message: "Orden enviada" });
})

app.get('/orders', async (req, res) => {
    const response = await pool.query('SELECT * FROM products');
    console.log(response.rows);
    res.status(200).json(response.rows);
})

app.listen(3000, () => {
	console.log("\nServer running on port 3000\n");
});