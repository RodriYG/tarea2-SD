# Tarea 2 - Sistemas Distribuidos
Ejecutar los contenedores con el comando:
```sh
docker-compose up
```
El servidor esta alojado en la dirección:
```sh
http://localhost:3000
```
Para usar el metodo POST se tienen las direcciones:
```sh
http://localhost:3000/new_order
```
Probar enviando mediante metodo POST un json con la siguiente estructura ejemplo:
```sh
{
    "name": "Pineapple",
    "price": 1000
}
```

Al probar este proyecto se enviarán las notificaciones a un correo de detino default, para elegir este correo dirigase al archivo ./consumer/consumer.js, y cambie el correo de destino en las lineas 96 y 129.
