module.exports = function(grunt) {
	'use strict';

	//load all grunt tasks
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('connect-livereload');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-closure-compiler');
	grunt.loadNpmTasks('grunt-wrap');

	//define tasks
	grunt.registerTask('server', ['connect:server', 'watch']);

	//grunt config
	grunt.initConfig({
		//======== 配置相关 ========
		pkg: grunt.file.readJSON('package.json'),
		src: '',
		concat: {
			dist: {
				src: ['src/0.3/$.js', 'src/0.3/View.js', 'src/0.3/ViewInstance.js', 'src/0.3/Handle.js', 'src/0.3/export.js', 'src/0.3/registerHandle.js', 'src/0.3/registerTrigger.js', 'src/0.3/*.js'],
				dest: 'build/0.3/HTML-ViewParse.debug.js'
			}
		},
		wrap: {
			basic: {
				src: ['build/0.3/HTML-ViewParse.debug.js'],
				dest: 'build/0.3/HTML-ViewParse.js',
				options: {
					wrapper: ['!(function viewParse(global) {\n', '\n}(this));']
				}
			}
		},
		uglify: {
			options: {
				beautify: false
			},
			my_target: {
				files: {
					'build/0.3/HTML-ViewParse.min.js': ['build/0.3/HTML-ViewParse.js']
				}
			}
		},
		'closure-compiler': {
			frontend: {
				closurePath: '/media/Develop/Lang/JAVA/compiler-latest',
				js: 'build/0.3/HTML-ViewParse.js',
				jsOutputFile: 'build/0.3/HTML-ViewParse.mincc.js',
				maxBuffer: 500,
				options: {
					compilation_level: 'ADVANCED_OPTIMIZATIONS',
					language_in: 'ECMASCRIPT5_STRICT'
				}
			}
		},
		//======== 开发相关 ========
		//开启服务
		connect: {
			options: {
				port: 9000,
				// Change this to '0.0.0.0' to access the server from outside.
				// hostname: 'localhost',
				hostname: '0.0.0.0',
				middleware: function(connect, options) {
					return [
						require('connect-livereload')({
							port: Number('<%= watch.options.livereload %>')
						}),
						connect.static(options.base),
					];
				}
			},
			server: {
				options: {
					// keepalive: true,
					base: '<%= src %>',
				}
			}
		},

		watch: {
			options: {
				livereload: 35729
			},
			demo: {
				files: ['demo/**']
			},
			js: {
				files: ['src/*.js', 'src/lib/*.js']
			},
			v3: {
				files: ['src/0.3/*.js'],
				tasks: ['concat', 'wrap', 'uglify'] //,'closure-compiler'
			}
		}


	});
};