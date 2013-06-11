var mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId;

var server = require('restify').createServer();

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
        db.collection(collection).find(function(err, docs) {
            documents = docs.map(function(document){
                var response = document;
                response.url = 'http://'+req.headers.host+'/'+collection+'/'+document._id;
            });
            res.send(docs);
        });
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
