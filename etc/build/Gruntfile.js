var path = require("path"),
    fs = require("fs"),
    mxClientContent,
    deps;

module.exports = function (grunt) {
    // To get the dependencies for the project, read the filenames by matching
    // mxClient.include([...]) in mxClient.js. This is not perfect, but the list is
    // required in mxClient.js for compatibility.
    mxClientContent = fs.readFileSync(
        path.join(process.cwd(), "./javascript/src/js/mxClient.js"),
        "utf8"
    );
    deps = mxClientContent.match(/mxClient\.include\([^"']+["'](.*?)["']/gi).map(function (str) {
        return "." + str.match(/mxClient\.include\([^"']+["'](.*?)["']/)[1];
    });
    deps = ["./js/mxClient.js"].concat(deps.slice(0));

  grunt.initConfig({
    copy: {
      main: {
        files: [{
          expand: true,
          cwd: "./javascript/src",
          src: deps,
          dest: "./javascript/dist"
        }],
        options: {
          // After each module, add the object to the '__mxOutput' namespace
          // E.g. __mxOutput.mxLog, etc.
          process: function (content, srcpath) {
            var afterContent = "",
                moduleName = path.basename(srcpath, ".js");

            afterContent += "\n__mxOutput." + path.basename(srcpath, ".js") +
              " = typeof " + moduleName + " !== 'undefined' ? " + moduleName + " : undefined;\n";

            return content + afterContent;
          }
        }
      }
    },
    concat: {
      dist: {
        src: deps.map(function (dep) {
          return path.join("./javascript/dist", dep);
        }),
        dest: './javascript/dist/build.js'
      },
      options: {
        banner: "(function (root, factory) {\n" +
          "if (typeof define === 'function' && define.amd) {\n" +
          "define([], factory);\n" +
          "} else if (typeof module === 'object' && module.exports) {\n" +
          "module.exports = factory();\n" +
          "} else {\n" +
          "root.mxgraph = factory();\n" +
          "}\n" +
          "}(this, function () {\n" +
          "return function (opts) {\n" +
          // Opts will be passed into this function, expand them out as if
          // they were globals so they can get picked up by the logic in
          // mxClient.js.
          "for (var name in opts) { this[name] = opts[name]; }\n" +
          "var __mxOutput = {};\n",
        footer: "return __mxOutput;\n" +
          "};\n" +
          "}));"
      }
    },
    webpack: {
      examples: {
        entry: "./javascript/examples/webpack/src/anchors.js",
        output: {
            path: path.resolve(process.cwd(), "./javascript/examples/webpack/dist"),
          filename: "anchors.js"
        }
      }
    },
    watch: {
      javascripts: {
        files: "javascript/src/**/*.js",
        tasks: ["umdify"],
        options: {
          interrupt: true
        }
      }
    },
  });

  require("load-grunt-tasks")(grunt);
  grunt.registerTask("default", [
    "copy",
    "concat",
    "webpack"
  ]);
  grunt.registerTask("build", [
    "default"
  ]);
};
