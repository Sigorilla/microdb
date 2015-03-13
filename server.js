var http = require( "http" );
var url = require( "url" );
var fs = require( "fs" );
var jsonql = require( "jsonql" );

var port = process.argv[2] || 1337;
var host = process.argv[3] || "127.0.0.1";

var path, query, result;

http.createServer( requestListener ).listen( port, host );

function requestListener ( req, res ) {
	var parseURL = url.parse( req.url, true );
	path = "db" + parseURL.pathname + ".json";
	query, result;

	fs.readFile( path, function ( err, data ) {
		if ( err ) {
			return showResult( res, 500, "Cannot read file '" + path + "'.", err, 500 );
		}

		var db = JSON.parse( data.toString() );
		if ( db ) {
			query = parseURL.query.query;
			if ( query ) {
				query = "$." + query;
				result = {};
				try {
					result = jsonql( query, db );
				} catch ( err ) {
					return showResult( res, 500, "Something wrong with 'jsonql'.", err );
				}
			} else {
				return showResult( res, 404, "No attribute 'query' in your query." );
			}
		} else {
			return showResult( res, 404, "DB is empty." );
		}

		if ( typeof result !== "undefined" ) {
			return showResult( res );
		} else {
			return showResult( res, 404, "Nothing is found for query: '" + query + "'." );
		}
	} );
}

function showResult ( res, code, data, err ) {
	code = code || 200;
	data = data || result;
	err = err || {};

	console.error( code, path, query, data, err );
	res.writeHead( code, { "Content-Type": "application/json" } );
	return res.end( JSON.stringify( { code: code, result: data } ) );
}

console.log( "Server running at http://" + host + ":" + port + "/" );
