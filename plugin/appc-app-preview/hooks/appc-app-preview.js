var _ = require("underscore"),
  fs = require("fs"),
  afs = require("node-appc").fs,
  path = require("path"),
  request = require('request'),
  fields = require("fields"),
  SERVER = "https://appbeta.appcelerator.com";

exports.cliVersion = '>=3.2';

var logger, platform, config, appc, appcConfig, j;

j = request.jar();

exports.init = function(_logger, _config, cli, _appc) {
  if (process.argv.indexOf('--app-preview') !== -1) {
    cli.addHook('build.pre.compile', configure);
    cli.addHook('build.finalize', upload2AppPreview);
  }
  logger = _logger;
  appcConfig = _config;
  appc = _appc;
};

function configure(data, finished) {
  config = {};
  config.releaseNotes = data.cli.argv['release-notes'];
  config.add = data.cli.argv['add'];
  config.notify = data.cli.argv['notify'];
  config.emails = data.cli.argv['invite'];

  if (!config.releaseNotes || !config.notify) {
    doPrompt(finished);
  } else {
    finished();
  }
}

function doPrompt(finishedFunction) {
  var f = {};

  if (config.releaseNotes === undefined) {
    f.releaseNotes = fields.text({
      title: "Release Notes",
      desc: "Enter release notes.",
      validate: function(value, callback) {
        callback(!value.length, value);
      }
    })
  }
  if (config.notify === undefined) {
    f.notify = fields.select({
      title: "Notify",
      desc: "Notify previous testers on upload.",
      promptLabel: "(y,n)",
      options: ['__y__es', '__n__o']
    });
  }

  var prompt = fields.set(f);

  prompt.prompt(function(err, result) {
    _.each(_.keys(result), function(key) {
      config[key] = result[key];
    });
    finishedFunction();
  });
}

var onUploadComplete = function(err, httpResponse, body) {
  if (err) {
    logger.error(err);
  } else {
    if (httpResponse.statusCode != 200) {
      logger.error('Error uploading to app preview, status code=' + httpResponse.statusCode);
    }
    logger.info("App uploaded successfully.");
    // check if we want to invite new testers
    if (config.emails) {
      logger.info('Adding tester(s) ' + config.emails + ' to latest build');
      var resp = JSON.parse(body);
      var r = request.post({
        jar: j,
        url: SERVER + '/apps/' + resp.appData.id + '/builds/' + resp.appData.latestBuild.id + '/team.json'
      }, function optionalCallback(err, httpResponse, body) {
        console.log( body );
        if (err) {
          logger.error(err);
        } else {
          logger.info("Tester(s) invited successfully.");
        }
      });
      var form = r.form();
      form.append('emails', config.emails);
    }
  }
}

function upload2AppPreview(data, finished) {
  validate(data);
  var sid = process.env.APPC_SESSION_SID;
  logger.info('Uploading app to App Preview');
  var cookie = request.cookie('connect.sid=' + sid);
  j.setCookie(cookie, SERVER);

  var obj = {
    url: SERVER + '/apps.json',
    jar: j,
    headers: {
      "user-agent": 'Appcelerator CLI'
    }
  };

  // configure proxy
  if (process.env.APPC_CONFIG_PROXY) {
    obj.proxy = process.env.APPC_CONFIG_PROXY;
  }

  var r = request.post(obj, onUploadComplete);

  var build_file = afs.resolvePath(path.join(data.buildManifest.outputDir, data.buildManifest.name + "." + (data.cli.argv.platform === "android" ? "apk" : "ipa")));

  var form = r.form();
  var file = fs.createReadStream(build_file);
  var totalSize = fs.statSync(build_file).size;
  var bytesRead = 0;
  var bar = new appc.progress('[INFO]  :paddedPercent [:bar] :etas', {
    width : 70,
    total: totalSize
  });
  file.on('data', function(chunk) {
    bar.tick( chunk.length );
  });
  form.append('qqfile', file);
  form.append('releaseNotes', config.releaseNotes);
  form.append('notify', config.notify.toString());
  if (config.add) {
    form.append('add', config.add.toString());
  }
}

function validate(data) {
  platform = data.cli.argv.platform;

  if (data.buildManifest.outputDir === undefined && data.iosBuildDir === undefined) {
    logger.error("Output directory must be defined to use --app-preview flag");
    return;
  }
  if (['android', 'ios'].indexOf(platform) === -1) {
    logger.error("Only android and ios support with --app-preview flag");
    return;
  }
}
