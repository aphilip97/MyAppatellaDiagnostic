'use strict';

var clone = require('clone');


var example_0_0_1 = function (para_in, para_out) {
  
  para_out.result_1_fp = para_in.param_1_fp * para_in.param_2_int;

}


var mappings = {
  v0_0_1: {
    version: "0.0.1",

    parameter_mappings: [
      {
        name: "param_1_fp",
        value: {
          content: "10.0",
          type: 1,
          min: 0,
          max: 100
        },
        description: "An example floating-point parameter"
      },
      {
        name: "param_2_int",
        value: {
          content: "2",
          type: 0,
          min: -2,
          max: 2
        },
        description: "An example integer parameter"
      }

    ],
    return_mappings: [
      {
        name: "result_1_fp",
        value: {
          content: "20.0",
          type: 2
        },
        description: "An example floating-point result"
      }
    ],
    function: example_0_0_1
  }
}


var defaultMapping = mappings.v0_0_1;

var createError = function (status, message) {

  var result = { status: 500, message: "server panicked." };

  if (status) {
    result.status = status;
  }
  if (message) {
    result.message = message;
  }

  return result;

}

var listMappings = function () {
  var list = [];
  var names = Object.getOwnPropertyNames(mappings);
  for (var index = 0; index < names.length; index++) {
    var mapping = mappings[names[index]];
    var item = sanitiseMapping(mapping);
    list.push(item);
  }
  return list;
}

var sanitiseMapping = function (mapping) {
  var result = null;
  if (mapping) {
    result = {};
    result.version = mapping.version;
    result.parameter_mappings = mapping.parameter_mappings;
    result.return_mappings = mapping.return_mappings;
  }
  return result;
}

var functionaliseMapping = function (mapping) {
  var result = null;
  if (mapping) {
    result = {};
    result.version = mapping.version;
    result.parameter_mappings = mapping.parameter_mappings;
    result.return_mappings = mapping.return_mappings;
    result.function = mapping.function;
  }
  return result;
}

var versionToMappingName = function (version) {
  var result = null;

  if (version.valueOf() == new String("default").valueOf()) {
    version = defaultMapping.version;
  }

  try {

    var replaced = version.split(".").join("_");
    result = "v" + replaced;

  } catch (e) {
    console.log("error converting to version mapping");
  }
  return result;
}

var getMapping = function (mappingName) {
  var result = defaultMapping;
  if (mappingName) {
    result = mappings[mappingName];
  }
  return result;
}

var createDiagnostic = function (version) {
  var result = functionaliseMapping(
    clone(
      getMapping(
        versionToMappingName(version)
      )));
  return result;
}


var findParameter = function (name, collection) {
  var result = null;
  for (var index = 0; index < collection.length; index++) {
    var candidate = collection[index];
    if (name.valueOf() == candidate.name.valueOf()) {
      result = candidate;
      break;
    }
  }
  return result;
}

var validateParameters = function (incumbentParameters, requestParameters) { // throws exception if incumbent parameter isn't fulfilled by incoming parameter
  var result = null;
  for (var index = 0; index < incumbentParameters.length; index++) {
    var incumbent = incumbentParameters[index];
    var candidate = findParameter(incumbent.name, requestParameters);
    
    if (!candidate) {
      throw ("This parameter was missing: " + incumbent.name);
    } else {
      var content = null;
      try{
        content = candidate.value.content;
      }catch(e){
      }
      if(content){
        if(content.length == 0){
          throw("This parameter didn't have a value: " + incumbent.name);
        }
      }else{
        throw("This parameter wasn't properly defined: " + incumbent.name);
      }

      candidate.tag = incumbent;
    }
  }
  // if we get here, all params in incumbents have counterparts in requests.
  result = requestParameters;
  return result;
}

var checkLimits = function (value, incumbent) {
  var min = null;
  var max = null;

  try {
    min = incumbent.value.min; // optional values. we expect to throw.    
  } catch (e) { }
  try {
    max = incumbent.value.max;
  } catch (e) { }

  if (min !== null) {
    if (value < min) {
      throw ("The parameter '" + incumbent.name + "' should be greater or equal to " + min + " but was " + value );
    }
  }

  if (max !== null) {
    if (value > max) {
      throw ("The parameter '" + incumbent.name + "' should be smaller or equal to " + max + " but was " + value );
    }
  }


}

var friendlyParseFloat = function (content, incumbent) {

  var result = null;
  try {
    result = parseFloat(content);
  } catch (e) {
    throw ("The parameter '" + incumbent.name + "' should be a floating-point number, but was: " + content);
  }

  if(isNaN(result)){
    throw ("The parameter '" + incumbent.name + "' should be a floating-point number, but was: " + content);
  }

  return result;
}


var friendlyParseInt = function (content, incumbent) {
  var result = null;
  try {
    result = parseInt(content);
  } catch (e) {
    throw ("The parameter '" + incumbent.name + "' should be a whole number, but was: " + content);
  }

  if(isNaN(result)){
    throw ("The parameter '" + incumbent.name + "' should be a whole number, but was: " + content);
  }

  return result;

}

var convertReturns = function (returnParameters) {
  var result = null;
  if (returnParameters) {
    var internalParameters = {};
    for (var index = 0; index < returnParameters.length; index++) {
      var candidate = returnParameters[index];

      internalParameters[candidate.name] = candidate.value.content;

    }
  }

  result = internalParameters;

  return result;
}


var convertParameters = function (taggedRequestParameters) {
  var result = null;
  if (taggedRequestParameters) {

    var internalParameters = {};
    for (var index = 0; index < taggedRequestParameters.length; index++) {
      var candidate = taggedRequestParameters[index];

      var name = null;
      var value = null;

      var name = candidate.tag.name;
      var type = candidate.tag.value.type;
      var content = candidate.value.content;

      switch (type) {
        case 0:
          value = friendlyParseInt(content, candidate.tag); // throws
          checkLimits(value, candidate.tag); // throws
          break;
        case 1:
          value = friendlyParseFloat(content, candidate.tag); // throws
          checkLimits(value, candidate.tag); // throws
          break;
        default:
          value = content;
      }
      internalParameters[name] = value;


    }
    result = internalParameters;

  }
  return result;
}

var populateReturns = function (returns, results) {
  if (returns) {
    for (var index = 0; index < returns.length; index++) {
      var item = returns[index];
      var name = item.name;
      var candidate = results[name];
      item.value.content = candidate.toString();
    }
  }
  return returns;
}





exports.getExample = function (args, res, next) {
  /**
   * parameters expected in the args:
  * version (String)
  **/

  var result = null;
  var version = null;
  if (args) {
    var arg = null;
    try {
      version = args.version.value;
    } catch (e) { } // couldn't tell what the edge cases were for this being. In the end, try catch was safest.
  }

  if (version) {
    // if we have a version defined, then attempt to find it
    var item = sanitiseMapping(
      getMapping(
        versionToMappingName(
          version)));
    if (item) {
      result = [];
      result.push(item);
    }
  } else {
    // otherwise, list the mappings
    result = listMappings();
  }

  res.setHeader('Content-Type', 'application/json');

  if (!result) {
    var error = createError(404, "couldn't find version: " + version);
    res.statusCode = error.status;
    res.write(JSON.stringify(error, null, 2));
  } else {
    res.write(JSON.stringify(result, null, 2));
  }


  res.end();

}

exports.postExample = function (args, res, next) {
  /**
   * parameters expected in the args:
  * version (String)
  * body (List)
  **/
  var error = null;
  var result = null;
  var version = null;
  var requestParameters = null;
  if (args) {
    try {
      version = args.version.value;
      requestParameters = args.body.value;
    } catch (e) { } // couldn't tell what the edge cases were for this. In the end, try catch was safest.
  }

  var diagnostic = createDiagnostic(
    version
  );

  if (diagnostic) {
    if (requestParameters) {

      var incomingParameters = null;
      var diagnosticParameters = null;
      var diagnosticReturns = null;

      try {
        incomingParameters = validateParameters(diagnostic.parameters, requestParameters); // throws
      } catch (e) {
        error = createError(400, "Invalid inputs: " + e);
        error.diagnostic = diagnostic;
      }

      if (!error) {

        try {
          diagnosticParameters = convertParameters(incomingParameters); // throws  
        } catch (e) {
          error = createError(400, "The diagnostic couldn't verify its input parameters: " + e);
          error.diagnostic = diagnostic;
        }
      }

      if (!error) {
        try {
          diagnosticReturns = convertReturns(diagnostic.returns);
        } catch (e) {
          error = createError(400, "The diagnostic couldn't supply the expected return values: " + e);
          error.diagnostic = diagnostic;
        }
      }

      if (!error) {
        try {
          diagnostic.function(diagnosticParameters, diagnosticReturns);
        } catch (e) {
          error = createError(500, "There was a problem running the diagnostic: " + e);
          error.diagnosticReturns = diagnosticReturns;
        }
      }

      if (!error) {
        try {
          result = populateReturns(diagnostic.returns, diagnosticReturns);
        } catch (e) {
          error = createError(500, "Diagnostic couldn't supply a return value of the expected format: " + e);
          error.diagnosticReturns = diagnosticReturns;
        }
      }

    } else {
      error = createError(400, "The diagnostic couldn't find the parameters it needed.");
    }
  } else {
    error = createError(400, "The diagnostic couldn't find a diagnostic function for the supplied version number: " + version);
  }


  res.setHeader('Content-Type', 'application/json');

  if (error) {
    res.statusCode = error.status;
    res.write(JSON.stringify(error, null, 2));
  } else {
    res.write(JSON.stringify(result, null, 2));
  }

  res.end();

}

