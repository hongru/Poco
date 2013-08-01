//init
var Poco = Poco || {};

Poco.mix = function (t, s, i) {
    if (i == undefined) { i = true }
    for (var k in s) {
        if (!t.hasOwnProperty(k) || i) {
            t[k] = s[k];
        }
    }
    return t;
}
