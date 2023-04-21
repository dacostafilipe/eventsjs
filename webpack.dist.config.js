'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './source/Events.js',
    output: {
        path: path.resolve(__dirname, 'dist/'),
        filename: 'events.js',
        library : 'Events',
        libraryTarget: 'var'
    },
    devtool: 'source-map',
	plugins: [
		new webpack.DefinePlugin({
			'__DEV__' : false
		}),
		new webpack.optimize.AggressiveMergingPlugin(),
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			mangle: true,
            sourceMap: true,
			compress: {
				warnings: false, // Suppress uglification warnings
				pure_getters: true,
				unsafe: true,
				unsafe_comps: true,
				screw_ie8: true
			},
			output: {
				comments: false,
			},
			exclude: [/\.min\.js$/gi] // skip pre-minified libs
		}),
	]
};