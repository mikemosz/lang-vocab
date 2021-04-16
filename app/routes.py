from flask import render_template
from flask import render_template_string
from flask import request
from flask import url_for

import pandas as pd 

from app import app

@app.route('/')
def index():
	return 'Hello World!'