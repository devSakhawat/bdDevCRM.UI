// postify.js
// Converts an object to an ASP.NET MVC  model-binding-friendly format
// Author: Nick Riggs
// http://www.nickriggs.com

$.postify = function(value) {
    var result = {};

    var buildResult = function(object, prefix) {
        for (var key in object) {

            var postKey = isFinite(key)
                ? (prefix != "" ? prefix : "") + "[" + key + "]"
                : (prefix != "" ? prefix + "." : "") + key;

            switch (typeof (object[key])) {
                case "number": case "string": case "boolean":
                    result[postKey] = object[key];
                    break;

                case "object":
                    if (object[key].toUTCString)
                        result[postKey] = object[key].toUTCString().replace("UTC", "GMT");
                    else {
                        buildResult(object[key], postKey != "" ? postKey : key);
                    }
            }
        }
    };

    buildResult(value, "");

    return result;
};