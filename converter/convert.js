var fs = require('fs');
var path = require('path');
var walk = function (dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};

walk('jslife', function (err, results) {
    if (err) throw err;
    const all = []
    for (const path of results) {
        const content = fs.readFileSync(path, 'utf-8')
        const out = convertFormat(path, content)
        all.push(out)
    }
    fs.writeFileSync("../patterns.js", "const patterns = " + JSON.stringify(all, null, 2))
});

const convertFormat = (path, content) => {
    const pathSplit = path.split("/")
    const title = pathSplit[pathSplit.length - 1]
    const lines = content.split("\n")
    let comment = ""
    let size = []
    let pattern = ""
    for (const line of lines) {
        if (line.startsWith("#")) {
            comment = comment + line
        } else {
            if (line.startsWith("x")) {
                const lineSplit = line.split(",")
                for (const split of lineSplit) {
                    const split2 = split.split("=")
                    size.push(split2[1].trim())
                }
            } else {
                pattern = pattern + line
            }
        }
    }
    return [title, comment, pattern, ...size]
}