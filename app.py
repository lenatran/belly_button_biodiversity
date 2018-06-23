# Dependencies
import pandas as pd
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from flask import Flask, jsonify, render_template

#################################################
# Database Setup
#################################################

# Create engine to belly_button_biodiversity.sqlite
engine = create_engine("sqlite:///belly_button_biodiversity.sqlite")

# Declare a Base
Base = automap_base()

# Reflect the database tables
Base.prepare(engine, reflect=True)

# Create variables for classes
Samples = Base.classes.samples
Otu = Base.classes.otu
Metadata = Base.classes.samples_metadata

# Create session
session = Session(engine)

#################################################
# Flask Setup
#################################################

app = Flask(__name__)

#################################################
# Flask Routes
#################################################

@app.route("/")
def home():
    """Render Home Page."""
    return render_template("index.html")


@app.route("/names")    
def names():
    """List of sample names."""
    query = "SELECT * FROM samples"
    df = pd.read_sql_query(query, session.bind)
    df.drop("otu_id", axis=1, inplace=True)
    names_list = list(df.columns)

    return jsonify(names_list)


@app.route("/otu")
def otu():
    """List of OTU descriptions."""
    query = "SELECT otu.lowest_taxonomic_unit_found FROM otu"
    df = pd.read_sql_query(query, session.bind)
    otu_list = list(df["lowest_taxonomic_unit_found"].values)
    
    return jsonify(otu_list)
        
    
@app.route("/metadata/<sample>")
def metadata(sample):
    """Metadata from a given sample."""
    query = f"SELECT samples_metadata.'AGE', samples_metadata.'BBTYPE', samples_metadata.'ETHNICITY', \
    samples_metadata.'GENDER', samples_metadata.'LOCATION', samples_metadata.'SAMPLEID' FROM samples_metadata"
    df = pd.read_sql_query(query, session.bind)
    df = df.loc[df["SAMPLEID"] == int(sample[3:])]
    metasample_dict = df.to_dict(orient="records")[0]
    
    return jsonify(metasample_dict)


@app.route("/wfreq/<sample>")
def wfreq(sample):
    """Weekly Washing Frequency as a number."""
    query = f"SELECT samples_metadata.'SAMPLEID', samples_metadata.'WFREQ' FROM samples_metadata"
    df = pd.read_sql_query(query, session.bind)
    df = df.loc[df["SAMPLEID"] == int(sample[3:])]
    wfreq_value = int(df["WFREQ"].values)
        
    return jsonify(wfreq_value)


@app.route("/samples/<sample>")
def samples(sample):
    """OTU IDs and Sample Values for a given sample."""
    query = f"SELECT otu_id, {sample} FROM samples"
    df = pd.read_sql_query(query, session.bind)
    df = df[df[sample] > 0]
    df.sort_values(by=sample, ascending=False, inplace=True)
    data = [{
        "otu_ids": df["otu_id"].values.tolist(),
        "sample_values": df[sample].values.tolist()
    }]


    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)