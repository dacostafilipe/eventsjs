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
    watchOptions: {
        poll: true
    },
    stats: {
        colors: true
    },
    devtool: 'source-map',
	plugins: [
		new webpack.DefinePlugin({
			'__DEV__' : true
		})
	]
};