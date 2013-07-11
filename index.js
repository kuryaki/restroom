var mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId;
var restify = require('restify');
var server = restify.createServer();
server.use(restify.queryParser({ mapParams: false }));
server.use(restify.requestLogger());

var restroom = function(database){
    var db = mongojs(database);

    server.get('/', function(req, res, next){
        db.collections(function(err, data){
            collections = data.map(function(collection){
                var response = {};
                response.name = collection.collectionName;
                response.url = 'http://'+req.headers.host+'/'+collection.collectionName;
                return response;
            });
            res.send(collections);
        });
    });

    server.get('/:collection', function(req, res, next){
        var collection = req.params.collection;
        var query = req.query;

        var page = parseInt(query.page) || 1;
        delete query.page;

        var per_page = parseInt(query.per_page) || 50;
        delete query.per_page;

        var count = query.hasOwnProperty('count');
        delete query.count;

        if(count){
            db.collection(collection)
                .find(query)
                .count(function(err, size) {
                    res.send(200,size);
            });
        }else{
            db.collection(collection)
                .find(query)
                .skip(per_page * (page - 1))
                .limit(per_page)
                .sort({_id:-1},function(err, docs) {
                    documents = docs.map(function(document){
                        var response = document;
                        response.url = 'http://'+req.headers.host+'/'+collection+'/'+document._id;
                    });
                    res.send(200,docs);
            });
        }

    });

    server.post('/:collection', function(req, res, next){
        var collection = req.params.collection;
        db.collection(collection).insert(req.body, function(err, doc) {
            if(doc){res.send(201);return;}
            res.send(err);
        });
    });

    server.put('/:collection/:document', function(req, res, next){
        var collection = req.params.collection;
        var document_id = req.params.document;
        db.collection(collection).update({_id:ObjectId(document_id)}, req.body, function(err, doc) {
            if(doc){res.send(200);return;}
            res.send(err);
        });
    });

    server.get('/:collection/:document', function(req, res, next){
        var collection = req.params.collection;
        var document_id = req.params.document;
        db.collection(collection).findOne({_id:ObjectId(document_id)},function(err, doc){
            res.send(doc || {});
        });
    });

};

restroom('restroom');

server.listen(1337, function(){
    console.log('%s listening at %s', server.name, server.url);
});

module.exports = restroom;
