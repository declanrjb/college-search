from flask import Flask, render_template, request
import os

from flask import Flask, jsonify, request
import math
import itertools

import pandas as pd
import requests
import json
import time
from dotenv import load_dotenv

import pandas as pd
import requests
import json
import time
from dotenv import load_dotenv
import os
from bs4 import BeautifulSoup
import mimetypes

directory = pd.read_csv('data/HD2024.csv')

def search_directory(query):
    query = query.lower()
    term_checker = lambda row: query in row.lower() if type(row) == str else False

    search_results = pd.concat([
        directory[directory['INSTNM'].apply(term_checker)],
        directory[directory['IALIAS'].apply(term_checker)]
    ]).drop_duplicates().reset_index(drop=True)

    return search_results

def search_directory_ui(query):
    temp = search_directory(query)
    return temp[['UNITID', 'INSTNM', 'STABBR']].to_dict(orient='records')

def param_string(parameters):
    string = ''
    for key in parameters:
        string += '&' + str(key) + '=' + str(parameters[key])
    return string

def assemble_query(parameters):
    url = f'https://customsearch.googleapis.com/customsearch/v1?cx={os.getenv("ENGINE_ID")}&key={os.getenv("API_KEY")}'
    url += param_string(parameters)
    url = url.replace(' ','+')
    return url

def send_query(query):
    data = requests.get(query)
    time.sleep(1)
    if data.status_code == 200:
        data = data.json()
        if 'items' in data:
            results = pd.DataFrame(data['items'])
            results['Query'] = query
            return results
    else:
        raise ValueError(f'query failed with status: {data.status_code}')

def retrieve_cds(unitid):
    curr_college = directory[directory['UNITID'].apply(lambda x: x == unitid)].reset_index(drop=True)

    query = assemble_query({
        'siteSearch': curr_college['WEBADDR'][0],
        'siteSearchFilter': 'i',
        'q': 'common data set',
        'fileType': 'pdf'
    })

    results = send_query(query)

    return results[['htmlTitle', 'link']].to_dict(orient='records')

def frame_url(url):
    if url is None:
        return ''
    else:
        return f'<a href="{url}">View Document</a>'

def retrieve_propublica_summary(unitid):
    curr_college = directory[directory['UNITID'].apply(lambda x: x == unitid)].reset_index(drop=True)
    ein = curr_college['EIN'][0]

    url = f'https://projects.propublica.org/nonprofits/api/v2/organizations/{ein}.json'

    data = requests.get(url).json()

    df = pd.DataFrame(data['filings_with_data'])

    df = df[['tax_prd_yr', 'totrevenue', 'totfuncexpns', 'totassetsend', 'totliabend', 'pdf_url']].rename({
        'tax_prd_yr': 'Year',
        'totrevenue': 'Total revenue',
        'totfuncexpns': 'Total expenses',
        'totassetsend': 'Total assets, end of year',
        'totliabend': 'Total liabilities, end of year',
        'pdf_url': 'Original Filing'
    }, axis=1)

    df['Original Filing'] = df['Original Filing'].apply(frame_url)

    return df.to_html()


# begin app definition
app = Flask(__name__)

# no modification required beyond function name
@app.route('/search')
def search():

    query = request.args['q']

    autocomps = search_directory_ui(query)

    result = {
        'completions': autocomps
    }

    response = jsonify(result)
    
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/cds')
def cds():
    unitid = int(request.args['unitid'])

    cds_records = retrieve_cds(unitid)

    result = {
        'cds': cds_records
    }

    response = jsonify(result)

    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/propublica')
def propublica():
    unitid = int(request.args['unitid'])

    response = retrieve_propublica_summary(unitid)

    # response = jsonify(response)

    # response.headers.add('Access-Control-Allow-Origin', '*')

    return response

if __name__ == '__main__':
    app.run(debug=True)