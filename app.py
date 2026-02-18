from flask import Flask, render_template, request
from flask_cors import CORS

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

from io import StringIO

from serpapi import GoogleSearch

import flask_csv

directory = pd.read_csv('data/web/HD2024.csv')

def search_directory(query):
    query = query.lower().strip()
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
    domain = curr_college['WEBADDR'][0]

    # identify cds homepage
    query = assemble_query({
        'siteSearch': domain,
        'siteSearchFilter': 'i',
        'q': 'common data set'
    })

    results = send_query(query)
    cds_homepage = results['link'][0]

    # identify possible cds documents

    query = assemble_query({
        'siteSearch': domain,
        'siteSearchFilter': 'i',
        'q': 'common data set',
        'fileType': 'pdf'
    })

    results = send_query(query)

    results = results[results['title'].apply(lambda x: 'common' in x.lower())]

    return {
        'homepage': cds_homepage,
        'documents': results[['htmlTitle', 'link']].to_dict(orient='records')
    }

def frame_url(url):
    if url is None:
        return ''
    else:
        return f'<a href="{url}">View Document</a>'

def parse_num(num):
    if type(num) == int or type(num) == float:
        return num
    else:
        try: 
            result = float(num.replace('$', '').replace(',', '').replace('%', ''))
        except:
            result = None
        return result

def posneg_colors(val):
    if val > 0:
        return '#6184d8'
    else:
        return '#ff6663'

def make_chart_data(df, x_axis, fields):

    new_fields = []
    for field in fields:
        total_incidents = sum(df[field])
        print(f'{field}: {total_incidents}')
        if total_incidents > 0:
            new_fields.append(field)
    
    fields = new_fields

    print(f'Fields after removal: {fields}')

    chart_field_map = {fields[i]: f'Field{i}' for i in range(0, len(fields))}

    chart_df = df.copy()
    chart_df = chart_df.rename(chart_field_map | {
        x_axis: 'x_axis'
    }, axis=1)

    chart_df = chart_df.sort_values('x_axis')

    for field in chart_field_map.values():
        chart_df[field] = chart_df[field].apply(parse_num)
        chart_df[field.replace('Field', 'Color')] = chart_df[field].apply(posneg_colors)

    charts = {
        'headers': fields,
        'data': chart_df.to_dict(orient='records')
    }

    return charts

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

    df['Net revenue'] = df['Total revenue'] - df['Total expenses']
    df['Original Filing'] = df['Original Filing'].apply(frame_url)

    result = {}

    result['charts'] = make_chart_data(df, 'Year', ['Total revenue', 'Net revenue'])

    result['data'] = df.to_html(index=False, escape=False)

    return result

def retrieve_top_officers(unitid):
    curr_college = directory[directory['UNITID'].apply(lambda x: x == unitid)].reset_index(drop=True)
    ein = curr_college['EIN'][0]

    url = f'https://projects.propublica.org/nonprofits/organizations/{ein}'

    soup = BeautifulSoup(requests.get(url).text)

    table = soup.select('.employees')
    df = pd.read_html(StringIO(str(table)))[0]
    df = df[df['Key Employees and Officers'].apply(lambda x: 'See filing' not in x)]

    name_pos_splits = df['Key Employees and Officers'].apply(lambda x: x.split('('))
    df['Name'] = name_pos_splits.apply(lambda lst: lst[0].strip())
    df['Position'] = name_pos_splits.apply(lambda lst: lst[1].replace(')', '').strip())

    df = df[['Name', 'Position', 'Compensation', 'Related', 'Other']]

    result = {}
    result['charts'] = make_chart_data(df, 'Name', ['Compensation', 'Related'])
    result['data'] = df.to_html(index=False, escape=False)

    return result

def retrieve_admissions_stats(unitid):
    adm_data = pd.read_csv('data/web/admissions.csv')
    adm_data = adm_data[adm_data['UNITID'].apply(lambda x: x == unitid)]
    adm_data = adm_data.drop('UNITID', axis=1)
    df = adm_data

    result = {}
    result['charts'] = make_chart_data(df, 'Year', ['Admission Rate', 'Yield'])
    result['data'] = df.to_html(index=False, escape=False)

    return result

def retrieve_enroll_totals(unitid):
    data = pd.read_csv('data/web/enrollment.csv')
    data = data[data['UNITID'].apply(lambda x: x == unitid)]
    data = data.drop('UNITID', axis=1)
    df = data

    result = {}
    result['charts'] = [
        make_chart_data(df, 'YEAR', ['undergraduate', 'graduate']),
        make_chart_data(df, 'YEAR', ['first_year'])
    ]
    result['data'] = df.to_html(index=False, escape=False)

    return result

def retrieve_hate(unitid):
    print('retrieving hate')
    data_bias = pd.read_csv('data/web/hate-by-bias.csv')
    data_crime = pd.read_csv('data/web/hate-by-crime.csv')

    data_bias = data_bias[data_bias['unitid'].apply(lambda x: x == unitid)]
    data_bias = data_bias.drop('unitid', axis=1)

    data_crime = data_crime[data_crime['unitid'].apply(lambda x: x == unitid)]
    data_crime = data_crime.drop('unitid', axis=1)

    result = {}
    result['charts'] = [
        make_chart_data(data_crime, 'Year', ['Aggravated Assault', 'Intimidation', 'Larceny', 'Simple Assault', 'Vandalism']),
        make_chart_data(data_bias, 'Year', ['Disability', 'Ethnicity', 'Gender', 'Gender Identity', 'National Origin', 'Race', 'Religion', 'Sexual Orientation'])
    ]
    result['data'] = data_bias.to_html(index=False, escape=False)

    return result

def retrieve_demos(unitid):
    gender = pd.read_csv('data/web/gender.csv')
    gender = gender[gender['UNITID'].apply(lambda x: x == unitid)]
    gender = gender.drop('UNITID', axis=1)

    ethnicity = pd.read_csv('data/web/ethnicity.csv')
    ethnicity = ethnicity[ethnicity['UNITID'].apply(lambda x: x == unitid)]
    ethnicity = ethnicity.drop('UNITID', axis=1)   

    result = {
        'gender': {
            'data': gender.to_html(index=False, escape=False),
            'charts': make_chart_data(gender, 'Demographic', ['Students'])
        },
        'ethnicity': {
            'data': ethnicity.to_html(index=False, escape=False),
            'charts': make_chart_data(ethnicity, 'Demographic', ['Students'])
        }
    }

    return result

def clean_news_article(article):
    if 'authors' in article['source']:
        article['author'] = ', '.join(article['source']['authors']) + ', '
    else:
        article['author'] = ''
    article['date'] = article['date'].split(',')[0]
    return article

def retrieve_recent_news(unitid):

    college_name = directory[directory['UNITID'].apply(lambda x: x == unitid)].reset_index()['INSTNM'][0]

    params = {
        "api_key": os.getenv('SERP_API'),
        "engine": "google_news",
        "hl": "en",
        "gl": "us",
        "q": college_name
    }

    search = GoogleSearch(params)
    results = search.get_dict()

    results['news_results'] = [clean_news_article(article) for article in results['news_results'][0:10]]

    return results

def retrieve_narrative_desc(unitid):
    directory = pd.read_csv('data/web/directory.csv')
    data = directory[directory['UNITID'].apply(lambda x: x == unitid)].to_dict(orient='records')[0]

    desc = f"""
    <p>{data['INSTNM']} is a <span class="sector">{data['SECTOR']}</span> institution located in {data['CITY']}, {data['STABBR']}. 
    The institution is located in a {data['LOCALE']}, and serves <span class="sbody-size">{data['INSTSIZE']}</span> students. 
    {data['CHFNM']} serves as {data['CHFTITLE']}. The institution offers <span class="degree-types">{data['degrees']}</span> degrees. 
    {data['hbcu_label']}
    """.replace('\n', '').strip() + '</p>'
    
    return {
        'data': desc
    }

def retrieve_crime(unitid):
    data = pd.read_csv('data/web/campus-crime.csv')
    data = data[data['unitid'].apply(lambda x: x == unitid)]
    data = data.drop('unitid', axis=1)
    df = data

    result = {}
    result['charts'] = [
        make_chart_data(df, 'Year', ['Murder', 'Robbery', 'Aggravated Assault', 'Burglary', 'Motor Vehicle Theft', 'Arson']),
        make_chart_data(df, 'Year', ['Rape', 'Fondling', 'Incest', 'Statuatory Rape'])
    ]
    result['data'] = df.to_html(index=False, escape=False)

    return result

def retrieve_discipline(unitid):
    data = pd.read_csv('data/web/discipline.csv')
    data = data[data['unitid'].apply(lambda x: x == unitid)]
    data = data.drop('unitid', axis=1)
    df = data

    result = {}
    result['charts'] = make_chart_data(df, 'Year', ['Liquor Law Violation', 'Drug Law Violation'])
    result['data'] = df.to_html(index=False, escape=False)

    return result

# begin app definition
app = Flask(__name__)
CORS(app)

# no modification required beyond function name
@app.route('/search')
def search():

    query = request.args['q']

    autocomps = search_directory_ui(query)

    result = {
        'completions': autocomps[0:10]
    }

    response = jsonify(result)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/cds')
def cds():
    unitid = int(request.args['unitid'])

    cds_records = retrieve_cds(unitid)

    result = {
        'data': cds_records
    }

    response = jsonify(result)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/propublica')
def propublica():
    unitid = int(request.args['unitid'])

    response = retrieve_propublica_summary(unitid)

    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/officers')
def officers():
    unitid = int(request.args['unitid'])

    response = retrieve_top_officers(unitid)

    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/admissions')
def admissions():
    unitid = int(request.args['unitid'])

    response = retrieve_admissions_stats(unitid)

    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/news')
def news():
    unitid = int(request.args['unitid'])

    response = retrieve_recent_news(unitid)

    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/narrative')
def narrative():
    unitid = int(request.args['unitid'])

    response = retrieve_narrative_desc(unitid)

    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/enrollment')
def enrollment():
    unitid = int(request.args['unitid'])

    response = retrieve_enroll_totals(unitid)

    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/demographics')
def demographics():
    unitid = int(request.args['unitid'])

    response = retrieve_demos(unitid)

    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/crime')
def crime():
    unitid = int(request.args['unitid'])

    response = retrieve_crime(unitid)

    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/discipline')
def discipline():
    unitid = int(request.args['unitid'])

    response = retrieve_discipline(unitid)

    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/hate')
def hate():
    unitid = int(request.args['unitid'])

    response = retrieve_hate(unitid)

    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/download', methods=['GET', 'POST'])
def download():

    table_html = request.form.getlist('table')[0]

    df = pd.read_html(StringIO(table_html))[0]

    response = jsonify({
        'data': df.to_csv()
    })

    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

if __name__ == '__main__':
    app.run(debug=True)