const { Connection, query } = require('stardog');

const conn = new Connection({
  username: 'reader',
  password: 'reader',
  endpoint: 'http://localhost:5820',
});

async function getPoints() {
    return await query.execute(conn, 'docedb', `SELECT *
    WHERE
    {
        ?point rdf:type :GeographicPoint .
        ?point wgs:lat ?latitude .
        ?point wgs:long ?longitude .
        ?point rdfs:label ?label .
        ?point rdfs:comment ?comment ;
        FILTER EXISTS {
            SELECT ?point WHERE {
                ?measurement a :Measurement ; 
                    :locatedIn ?point .
            }
        }
    }`, 'application/sparql-results+json');
}

async function getAgents() {
    return await query.execute(conn, 'docedb', `SELECT ?agent
    WHERE 
    {
        ?agent a :Agent .
    }`, 'application/sparql-results+json');
}

async function getWaterQualities() {
    return await query.execute(conn, 'docedb', `SELECT *
    WHERE {
        ?subQuality rdfs:subClassOf* <http://purl.org/nemo/gufo#Quality> .
        ?subQuality rdfs:subClassOf ?superQuality .
        ?subQuality rdfs:label ?label
        FILTER ( lang(?label) = 'en' )
    } ORDER BY ?superQuality`, 'application/sparql-results+json');
}

async function getMeasurementsWithFilters(params) {
    let agentsCondition = getAgentCondition(params.agents);
    let waterQualitiesCondition = getWaterQualitiesCondition(params.waterQualities);
    return await query.execute(conn, 'docedb', `SELECT *
    WHERE
    {
        ?measurement rdf:type :Measurement ;
                     gufo:hasBeginPointInXSDDateTimeStamp ?initialDate ;
                     gufo:hasEndPointInXSDDateTimeStamp ?finalDate ;
                     :measuredQualityKind ?qualityKind ;
                     gufo:hasQualityValue ?qualityValue ;
                     :locatedIn ?geoPoint ;
                     :expressedIn ?unit .
        ?geoPoint wgs:lat ?latitude ;
                  wgs:long ?longitude ;
                  rdfs:comment ?geoComment ;
                  rdfs:label ?geoLabel .
        ?agent gufo:participatedIn ?measurement .
        ?qualityKind rdfs:label ?qualityKindLabel .
        FILTER (
            ( lang(?qualityKindLabel) = 'en' )
            ${params.geoPoint ? "&& (?geoPoint = <" + params.geoPoint + ">)" : ""}
            ${params.initialDate ? "&& (?initialDate > \"" + params.initialDate + "\"^^xsd:dateTime)" : ""}
            ${params.finalDate ? "&& (?finalDate < \"" + params.finalDate + "\"^^xsd:dateTime)" : ""}
            ${agentsCondition}
            ${waterQualitiesCondition}
        ) .
    }
    ORDER BY ?geopoint`, 'application/sparql-results+json', { 
        reasoning: true,
        offset: 0,
        limit: 200000
    });
}

// ----- Helpers -----

function getAgentCondition(agents) {
    let agentsCondition = "";
    if(agents.length) {
        for (let index = 0; index < agents.length; index++) {
            if(index == 0) {
                agentsCondition += "&& (?agent = <" + agents[index] + ">";
            } else {
                agentsCondition += " || ?agent = <" + agents[index] + ">";
            }
        }
        agentsCondition += ")";
    }
    return agentsCondition;
}

function getWaterQualitiesCondition(waterQualities) {
    let waterQualitiesCondition = "";
    if(waterQualities.length) {
        for (let index = 0; index < waterQualities.length; index++) {
            if(index == 0) {
                waterQualitiesCondition += "&& (?qualityKind = <" + waterQualities[index] + ">";
            } else {
                waterQualitiesCondition += " || ?qualityKind = <" + waterQualities[index] + ">";
            }
        }
        waterQualitiesCondition += ")";
    }
    return waterQualitiesCondition;
}

export {
    getPoints,
    getAgents,
    getWaterQualities,
    getMeasurementsWithFilters
}