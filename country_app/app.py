from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# Route to display the homepage
@app.route('/')
def index():
    return render_template('index.html')

# Route to fetch and filter countries
@app.route('/countries', methods=['GET'])
def get_countries():
    attribute = request.args.get('attribute')
    value = request.args.get('value').lower()
    url = 'https://restcountries.com/v3.1/all'
    response = requests.get(url)
    
    if response.status_code == 200:
        countries = response.json()
        
        # Filter countries by attribute and value if both are provided
        if attribute and value:
            if attribute == 'languages':
                # Special handling for languages attribute
                countries = [
                    country for country in countries
                    if 'languages' in country and
                    any(lang.lower() == value for lang in country['languages'].values())
                ]
            elif attribute == 'currencies':
                # Special handling for currencies attribute
                countries = [
                    country for country in countries
                    if 'currencies' in country and
                    any(curr.lower() == value for curr in country['currencies'].keys())
                ]
            else:
                # Generic filter for other attributes, with .get() to avoid AttributeError
                countries = [
                    country for country in countries
                    if isinstance(country.get(attribute, ""), str) and country.get(attribute, "").lower() == value
                ]
        return jsonify(countries)
    else:
        return jsonify({"error": "Could not retrieve country data"}), response.status_code


if __name__ == '__main__':
    app.run(debug=True, port=5001)
