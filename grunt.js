module.exports = function( grunt ) {

function getDate() {
	var date = new Date(),
		year = date.getFullYear(),
		month = date.getMonth() + 1,
		day = date.getDate();
	if ( month < 10 ) {
		month = "0" + month;
	}
	if ( day < 10 ) {
		day = "0" + day;
	}
	return year + "-" + month + "-" + day;
}

function createBanner( module ) {
	return "/*! Amplify " + module + " v" + version + " - http://amplifyjs.com\n" +
		" * Copyright (c) " + year + " appendTo LLC (http://appendto.com/team)\n" +
		" * Licensed " + licenses + " http://appendto.com/open-source-licenses */"
}

var package = require( "./package" ),
	licenses = grunt.utils._.pluck( package.licenses, "type" ).join( ", " ),
	version = package.version,
	year = (new Date()).getFullYear(),
	buildDate = getDate();

grunt.initConfig({
	meta: {
		bannerCore: createBanner( "Core" ),
		bannerStore: createBanner( "Store" ),
		bannerRequest: createBanner( "Request" ),
		bannerAll: createBanner( "Core, Store, Request" )
	},

	lint: {
		src: "*/amplify.*.js",
		test: "*/test/*.js",
		grunt: "grunt.js"
	},

	copy: {
		dist: {
			src: [
				"*LICENSE*"
			],
			renames: {
				"build/README.txt": "README.txt",
				"vsdoc/amplify-vsdoc.js": "amplify-vsdoc.js"
			},
			dest: "dist"
		},
		src: {
			src: [
				"core/**",
				"store/**",
				"request/**",
				"external/**",
				"test/**",
			],
			renames: {
				"build/src-README.txt": "README.txt"
			},
			dest: "dist/src"
		}
	},

	concat: {
		full: {
			src: [
				"<banner:meta.bannerAll>",
				"dist/src/core/amplify.core.js",
				"dist/src/store/amplify.store.js",
				"dist/src/request/amplify.request.js"
			],
			dest: "dist/amplify.js"
		}
	},

	min: {
		"dist/individual/amplify.core.min.js": [ "<banner:meta.bannerCore>", "core/amplify.core.js" ],
		"dist/individual/amplify.store.min.js": [ "<banner:meta.bannerStore>", "store/amplify.store.js" ],
		"dist/individual/amplify.request.min.js": [ "<banner:meta.bannerRequest>", "request/amplify.request.js" ],
		"dist/amplify.min.js": [ "<banner:meta.bannerAll>", "dist/amplify.js" ]
	}
});

grunt.registerTask( "clean", function() {
	require( "rimraf" ).sync( "dist" );
});

grunt.registerMultiTask( "copy", "Copy files to destination folder and replace @tokens", function() {
	function replaceTokens( source ) {
		return source
			.replace( /@VERSION/g, version )
			.replace( /@BUILD_DATE/g, buildDate );
	}

	function copyFile( src, dest ) {
		if ( /(js|css|txt)$/.test( src ) ) {
			grunt.file.copy( src, dest, {
				process: replaceTokens
			});
		} else {
			grunt.file.copy( src, dest );
		}
	}

	var fileName,
		files = grunt.file.expandFiles( this.file.src ),
		target = this.file.dest + "/",
		renameCount = 0;

	files.forEach(function( fileName ) {
		copyFile( fileName, target + fileName );
	});
	grunt.log.writeln( "Copied " + files.length + " files." );

	for ( fileName in this.data.renames ) {
		renameCount += 1;
		copyFile( fileName, target + grunt.template.process( this.data.renames[ fileName ], grunt.config() ) );
	}
	if ( renameCount ) {
		grunt.log.writeln( "Renamed " + renameCount + " files." );
	}
});

grunt.registerTask( "default", "clean copy concat min" );

};
