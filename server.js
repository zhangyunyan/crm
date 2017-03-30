var http=require('http');
var fs=require('fs');
var url=require('url');
var mime=require('mime');
var result={
    code:1,
    msg:'error',
    data:null
};
function readUsers(callback) {
    fs.readFile('./custom.json','utf8',function (err, data) {
        if(err||data=='') data='[]';
        data=JSON.parse(data);
        callback(data);
    })
}
function writeUsers(data, callback) {
    fs.writeFile('./custom.json',JSON.stringify(data),callback);
}
http.createServer(function (req, res) {
    var urlObj=url.parse(req.url,true);
    var pathname=urlObj.pathname;
    if(pathname=='/'){
        res.setHeader('Content-Type','text/html;charset=utf8');
        fs.createReadStream('./index.html').pipe(res);
        return;
    }
    if(pathname=='/getAllList'){
        readUsers(function (data) {
            result={
                code:0,
                msg:'success',
                data:data
            };
            res.end(JSON.stringify(result));
        });
        return;
    }
    if(pathname=='/getInfo'){
        var id=urlObj.query.id;
        readUsers(function (data) {
            var user=data.find(function (item) {
                return item.id==id;
            });
            result={
                code:0,
                msg:'success',
                data:user
            };
            res.end(JSON.stringify(result));
        });
        return;
    }
    if(pathname=='/removeInfo'){
        id=urlObj.query.id;
        readUsers(function (data) {
            data=data.filter(function (item) {
                return item.id!=id;
            });
            writeUsers(data,function () {
                result={
                    code:0,
                    msg:'success'
                };
                res.end(JSON.stringify(result));
            });
        });
        return;

    }
    if(pathname=='/addInfo'){
        var str='';
        req.on('data',function (chunk) {
            str+=chunk;
        });
        req.on('end',function () {
            str=JSON.parse(str);
            readUsers(function (data) {
                str.id=data.length?parseFloat(data[data.length-1].id)+1:1;
                data.push(str);
                writeUsers(data,function () {
                    result={
                        code:0,
                        msg:'success'
                    };
                    res.end(JSON.stringify(result));
                })
            })
        });
        return;
    }
   if(pathname=='/updateInfo'){
       str='';
       req.on('data',function (chunk) {
           str+=chunk;
       });
       req.on('end',function () {
           str=JSON.parse(str);
           readUsers(function (data) {
               data=data.map(function (item) {
                   if(item.id==str.id){
                       return str;
                   }
                   return item;
               });
               writeUsers(data,function () {
                   result={
                       code:0,
                       msg:'success'
                   };
                   res.end(JSON.stringify(result));
               })
           });

       })
       return;
   }


    fs.exists('.'+pathname,function (flag) {
        if(flag){
            res.setHeader('Content-Type',mime.lookup(pathname)+';charset=utf8');
            fs.createReadStream('.'+pathname).pipe(res);
        }else {
            res.statusCode=404;
            res.end('Not Found');
        }
    })



}).listen(80);