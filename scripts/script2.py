import requests
import pandas as pd
import time

def test_api():
    data = pd.read_csv('../postgres/products.csv')

    # Dividir los datos en lotes de 50 filas
    batches = [data[i:i+50] for i in range(0, data.shape[0], 50)]

    for batch in batches:
        for i, row in batch.iterrows():
            try:
                response = requests.post('http://localhost:3000/new_order', json={
                    'name': row['product_name'],
                    'price': row['price']
                })
                print(f'Row {i} - Status: {response.status_code}')
            except Exception as e:
                print(f'Error on row {i}: {str(e)}')

        # Esperar 4 segundos antes de enviar el siguiente lote
        time.sleep(4)

test_api()