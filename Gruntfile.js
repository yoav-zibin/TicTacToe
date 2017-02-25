module.exports = function(grunt) {
  // Auto resize (and pad with white color) an image
  // into multiple sizes for Google&Apple app submission.
  // I use 'sips' command line to resize and pad images,
  // which only work on MAC OSx.
  var src_img = "src.png";
  var src_img_width_to_height_ratio = 1024/1024;
  var directory = "auto_resize_images";
  var output_directory = directory + "/output";
  var padColor = "FFFFFF"; // white in HEX
  var desired_sizes = [
    "1024x1024",
    "1024x500",
    "512x512",
    "50x50",
    "200x200",
    "180x120",
    "1280x720",
    "320x50",
    "android/7inTablet-615x984",
    "android/10inTablet-656x1048",
    "android/Phone-656x1054",
    "ios/iPad-768x1024",
    "ios/iPadPro-2732x2048",
    "ios/iphone4-3.5inch-640x960",
    "ios/iphone5-4inch-640x1096",
    "ios/iphone6-4.7inch-750x1334",
    "ios/iphone6plus-5.5inch-1242x2208",
    "phonegap/icon-29",
    "phonegap/icon-40",
    "phonegap/icon-50",
    "phonegap/icon-57",
    "phonegap/icon-58",
    "phonegap/icon-60",
    "phonegap/icon-72",
    "phonegap/icon-76",
    "phonegap/icon-80",
    "phonegap/icon-87",
    "phonegap/icon-100",
    "phonegap/icon-114",
    "phonegap/icon-120",
    "phonegap/icon-144",
    "phonegap/icon-152",
    "phonegap/icon-180",
    "phonegap/icon-512",
    "phonegap/splash-1536x2048",
    "phonegap/splash-1024x768",
    "phonegap/splash-1242x2208",
    "phonegap/splash-2048x1536",
    "phonegap/splash-2208x1242",
    "phonegap/splash-320x480",
    "phonegap/splash-640x1136",
    "phonegap/splash-640x960",
    "phonegap/splash-750x1334",
    "phonegap/splash-768x1024",
    "phonegap/splash-512x512",
  ];
  var commands = [];
  var subdirectories = {};
  commands.push('rm -rf ' + output_directory);
  commands.push('mkdir ' + output_directory);
  commands.push('mkdir ' + output_directory + '/temp');
  for (var i = 0; i < desired_sizes.length; i++) {
    var desired_size = desired_sizes[i];
    if (desired_size.split('/').length >= 3) {
      throw new Error("You can have at most one sub-directory in filename: " + desired_size);
    }
    var slashIndex = desired_size.indexOf("/");
    if (slashIndex !== -1) {
      var subdirectory = desired_size.substring(0, slashIndex);
      if (!subdirectories[subdirectory]) {
        subdirectories[subdirectory] = true;
        commands.push('mkdir ' + output_directory + '/' + subdirectory);
      }
    }
    var lastDashIndex = desired_size.lastIndexOf("-");
    var dimensions = desired_size.substring(lastDashIndex + 1);
    var width_height = dimensions.split("x");
    var width = Number(width_height[0]);
    var height = Number(width_height[width_height.length - 1]);
    if (dimensions != '' + (width_height.length == 1 ? width : width + "x" + height)) {
      throw new Error("Illegal dimension size in filename '" + desired_size + "'. You should have a dimension suffix, e.g., 'blabla-512x200'");
    }
    // Determining whether the limiting factor is height or width
    var is_height_limiting = width / src_img_width_to_height_ratio > height;
    var scale_to_width = is_height_limiting ? height * src_img_width_to_height_ratio : width;
    var scale_to_height = is_height_limiting ? height : width / src_img_width_to_height_ratio;
    commands.push('sips ' + directory + '/' + src_img + ' --resampleHeightWidth ' +
        scale_to_height + ' ' + scale_to_width +
        ' -s format bmp --out ' + output_directory + '/temp/' + dimensions + '.bmp');
    commands.push('sips ' + output_directory +
      '/temp/' + dimensions + '.bmp -s format png --padToHeightWidth ' +
      height + ' ' + width +
      ' --padColor ' + padColor + ' --out ' + output_directory + '/' + desired_size + ".png");
  }
  commands.push('rm -rf ' + output_directory + '/temp');
  var auto_resize_images_command = commands.join(" && ");

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    shell: {
      auto_resize_images_on_mac: {
        command: auto_resize_images_command
      }
    },
    ts: {
      default: {
        options: {
          fast: 'never' // disable the grunt-ts fast feature
        },
        tsconfig: true
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    copy: {
      imgs: {
        expand: true,
        src: 'imgs/*.*',
        dest: 'dist/'
      },
      sw: {
        src: 'service-worker.js',
        dest: 'dist/service-worker.js', // // I can also use uglify with a banner (to add a timestamp), but the file is so small it's not worth the complexity.
        options: {
          process: function (content, srcpath) {
            return content.replace('<REPLACE_WITH_DATE_IN_GRUNT>', new Date().toISOString());
          },
        },
      },
    },
    concat: {
      options: {
        separator: '\n;\n',
      },
      js: {
        src: [
          'lib/angular.js',
          'lib/turnBasedServices.4.js',
          'ts_output_readonly_do_NOT_change_manually/src/gameLogic.js',
          'ts_output_readonly_do_NOT_change_manually/src/game.js',
          'ts_output_readonly_do_NOT_change_manually/src/aiService.js'],
        dest: 'dist/js/everything.js',
      },
    },
    postcss: {
      options: {
        map: {
          inline: false, // save all sourcemaps as separate files...
          annotation: 'dist/css/maps/' // ...to the specified directory
        },
        processors: [
          require('autoprefixer')(), // add vendor prefixes
          require('cssnano')({safe: true}) // minify the result, skipping unsafe optimizations
        ]
      },
      dist: {
        src: 'css/game.css',
        dest: 'dist/css/everything.min.css',
      }
    },
    uglify: {
      options: {
        sourceMap: true,
      },
      my_target: {
        files: {
          'dist/js/everything.min.js': ['dist/js/everything.js']
        }
      }
    },
    processhtml: {
      dist: {
        files: {
          'dist/index.min.html': ['index.html']
        }
      }
    },
    manifest: {
      generate: {
        options: {
          basePath: '.',
          cache: [
            // Use the same list in service-worker.js !
            'js/everything.min.js',
            'css/everything.min.css',
          ],
          network: [
            '*',
          ],
          timestamp: true
        },
        dest: 'dist/index.min.appcache',
        src: []
      }
    },
    'http-server': {
        'dev': {
            // the server root directory
            root: '.',
            port: 9000,
            host: "0.0.0.0",
            cache: 1,
            showDir : true,
            autoIndex: true,
            // server default file extension
            ext: "html",
            // run in parallel with other tasks
            runInBackground: true
        }
    },
    protractor: {
      options: {
        configFile: "protractor.conf.js", // Default config file
        keepAlive: false, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
          // Arguments passed to the command
        }
      },
      all: {}
    },
  });

  require('load-grunt-tasks')(grunt);

  // Default task(s).
  grunt.registerTask('default', [
      'ts',
      'karma',
      'copy',
      'concat', 'postcss', 'uglify',
      'processhtml', 'manifest',
      'http-server', 'protractor']);
  grunt.registerTask('e2e', [
      'http-server', 'protractor']);
};
