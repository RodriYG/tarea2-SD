const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Kafka, logLevel } = require("kafkajs");
const pg = require('pg');
const nodemailer = require('nodemailer');

const pool = new pg.Pool({
    user: 'user',
    host: 'postgres',
    database: 'tarea2',
    password: 'user',
    port: 5432
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'testmailkafka@gmail.com',
        pass: 'qyixmqzthkghhckq',
    }
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

const kafka = new Kafka({
    clientId: "my-app",
    brokers: ["kafka:9092"],
    logLevel: logLevel.NOTHING
});

const update = async (message) => {
    producer = kafka.producer();
    await producer.connect();
    
    const id = JSON.parse(message.value.toString()).id;
    const name = JSON.parse(message.value.toString()).name;
    const price = JSON.parse(message.value.toString()).price;
    var status = (await pool.query('SELECT status FROM products WHERE id = $1', [id])).rows[0].status;
    
    if (status === "recibido") {
        status = "preparando";
        await pool.query('UPDATE products SET status = $1 WHERE id = $2', [status, id]);
        await producer.send({
            topic: "test",
            messages: [
                { value: JSON.stringify({ id, name, price, status }) }
            ]
        });
    }
    else if (status === "preparando") {
        status = "enviado";
        await pool.query('UPDATE products SET status = $1 WHERE id = $2', [status, id]);
        await producer.send({
            topic: "test",
            messages: [
                { value: JSON.stringify({ id, name, price, status }) }
            ]
        });
    }
    else if (status === "enviado") {
        status = "entregado";  
        await pool.query('UPDATE products SET status = $1 WHERE id = $2', [status, id]);
        await producer.send({
            topic: "test",
            messages: [
                { value: JSON.stringify({ id, name, price, status }) }
            ]
        });
    }

    producer.disconnect();
}

const listening = async () => {
    const consumer = kafka.consumer({ groupId: "hola" });
    const consumer_aux = kafka.consumer({ groupId: "updates" });
    await consumer.connect();
    await consumer_aux.connect();
    await consumer.subscribe({ topic: "delivery", fromBeginning: true });
    await consumer_aux.subscribe({ topic: "test", fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const id = JSON.parse(message.value.toString()).id;
            const name = JSON.parse(message.value.toString()).name;
            const price = JSON.parse(message.value.toString()).price;
            const status = JSON.parse(message.value.toString()).status;
            console.log("\nPedido recibido")
            console.log("Pedido id: " + id + ", nombre: " + name+ ", precio: " + price + ", estado: " + status);
            let email = {
                from: 'testmailkafka@gmail.com',
                to: 'testmailkafka@gmail.com',
                subject: 'Pedido ' + id + ' Producto: ' + name,
                text: 'Estado de tu pedido: ' + status + '.'
            };
            transporter.sendMail(email, (error, info) => {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Email sent: ' + info.response);
                }
            });
            let count = 0;
            const intervalId = setInterval(() => {
              update(message);
              count++;
              if (count === 3) {
                clearInterval(intervalId);
              }
            }, 1000 * 30);
        }
    })
    await consumer_aux.run({
        eachMessage: async ({ topic, partition, message }) => {
            const id = JSON.parse(message.value.toString()).id;
            const name = JSON.parse(message.value.toString()).name;
            const price = JSON.parse(message.value.toString()).price;
            const status = JSON.parse(message.value.toString()).status;
            console.log("Pedido id: " + id + ", nombre: " + name+ ", precio: " + price + ", estado: " + status);
            let email = {
                from: 'testmailkafka@gmail.com',
                to: 'testmailkafka@gmail.com',
                subject: 'Pedido ' + id + ' Producto: ' + name,
                text: 'Estado de tu pedido: ' + status + '.'
            };
            transporter.sendMail(email, (error, info) => {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    });
}


listening();

app.listen(3001, () => {
	console.log("\nServer running on port 3001\n");
});