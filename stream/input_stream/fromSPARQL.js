var SparqlClient = require('sparql-client-2');
var SPARQL = SparqlClient.SPARQL;
var util = require('util');
var stream = require('stream');
var async = require('async');
var PropertiesReader = require('properties-reader');
var path = require('path');
var request = require('request');
var fs = require('fs');

var configuration = PropertiesReader(path.resolve(__dirname, '../../', 'config', 'config.properties'));

var Transform = stream.Transform || require('readable-stream').Transform;

function SPARQLStream(options) {


  this.limit = 10;
  this.skip = 0;

  this.endpoint = configuration.get('rdf_query_endpoint');

  this.query = fs.readFileSync(path.resolve(__dirname, '../../', 'rdf', 'selectGraphsWithTS.q')).toString();

  this.client = new SparqlClient(this.endpoint);

  var cache = [];

  var _this = this;

  var timedPush = function(data, callback) {
    console.log(data);

    var query = fs.readFileSync(path.resolve(__dirname, '../../', 'rdf', 'getGraphContent.q')).toString();

    query = query.split('[graph]').join(data.graph);

    var options = {
      url: configuration.get('rdf_query_endpoint'),
      method: 'POST',
      form: {
        query: query
      },
      headers: {
        Accept: 'application/ld+json'
      }
    };


    request.post(options, function(error, response, body) {

      _this.push(body);
      console.log('Next event in ' + data.delta || 0 + 'ms');
      return setTimeout(callback, data.delta || 0);
    });
  };

  this.handleResults = function(data) {

    if (!data.results.bindings) {
      console.log('No graphs retrieved');
      this.push(null);
    }


    for (var i = 0; i < data.results.bindings.length; i++) {
      var b = data.results.bindings[i];

      var graph = b.graph.value;
      var ts = b.ts.value;

      var delta = null;

      if (i < data.results.bindings.length - 1) {

        delta = new Date(data.results.bindings[i + 1].ts.value).getTime() - new Date(ts).getTime();
      }

      cache.push({
        graph: graph,
        ts: ts,
        delta: delta
      });
    }

    async.eachSeries(cache, timedPush, function() {
      console.log('Stream finished');
    });
  };

  this.queryEndpoint = function() {

    this.client
      .query(this.query)
      .execute(function(err, data) {
        if (err) throw err;

        _this.handleResults(data);
      });

    /*console.log(this.query)
    var options = {
      url: configuration.get('rdf_query_endpoint'),
      method: 'POST',
      form: {
        query: this.query
      },
      headers: {
        Accept: 'application/json'
      }
    };

    request.post(options, function(error, response, body) {
      if (error) throw error;

      console.log(body)
      _this.handleResults(body);
    })*/
  };

  this.queryEndpoint();


  // allow use without new
  if (!(this instanceof SPARQLStream)) {
    return new SPARQLStream(options);
  }

  // init Transform
  Transform.call(this, options);
}
util.inherits(SPARQLStream, Transform);


SPARQLStream.prototype._transform = function(chunk, enc, cb) {

  cb();
};



exports = module.exports = SPARQLStream;