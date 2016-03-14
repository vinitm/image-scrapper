var fs = require('fs'),
    xlsx = require('xlsx-writestream'),
    Xray = require('x-ray'),
    request=require('request'),
    phantom = require('x-ray-phantom');

var x = Xray().driver(phantom({
    webSecurity: false
}));

var selectors = {
    parent: '.zg_itemImmersion',
    children: [{
        imgLink: 'img@src',
        name: '.zg_title a',
        price: '.price'
    }]
}

var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

var ExcelWriter = {
    initialize: function () {
        var writer = new xlsx('mySpreadsheet.xlsx', {});
        writer.getReadStream().pipe(fs.createWriteStream('mySpreadsheet.xlsx'));
        this.writer = writer;
    },
    write: function (data) {
        this.writer.addRow({
            "Index": data.index,
            "Name": data.name,
            "Price": data.price
        })
    }
};

var afterScraping = function (err, obj) {
    var taskCounter = obj.length;
    var name_count = 1;
    ExcelWriter.initialize();
    var callback = function (item) {
        console.log('item=' + item.name);
        var innerCount = name_count;
        var afterDownload = function () {
            ExcelWriter.write({
                index: innerCount,
                name: item.name,
                price: item.price
            });
            if (!--taskCounter) {
                ExcelWriter.writer.finalize();
                console.log('writer closed');
            }
            console.log(innerCount + ' downloaded');
        };
        download(item.imgLink, './images/' + innerCount + '.jpg', afterDownload);
        name_count++;
    };
    obj.forEach(callback);
};

x('http://www.amazon.co.uk/Best-Sellers-Electronics-Phones/zgbs/electronics/560820/ref=sv_phones-acc_0', selectors.parent, selectors.children)(afterScraping);

/*download('https://cdn.colorlib.com/wp/wp-content/uploads/sites/2/2014/02/instagram-logo.jpg', './images/google.jpg', function () {
    console.log('done');
});*/




/*var writer = new xlsx('mySpreadsheet.xlsx', {});

writer.getReadStream().pipe(fs.createWriteStream('mySpreadsheet.xlsx'));

writer.addRow({
    "Name": "vinit",
    "Location": "Sweden"
});

writer.finalize();*/