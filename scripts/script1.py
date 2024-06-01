import requests
import pandas as pd

def test_api():
    data = pd.read_csv('../postgres/products.csv')

    for i, row in data.iterrows():
        try:
            response = requests.post('http://localhost:3000/new_order', json={
                'name': row['product_name'],
                'price': row['price']
            })
            print(f'Row {i} - Status: {response.status_code}')
        except Exception as e:
            print(f'Error on row {i}: {str(e)}')

test_api()