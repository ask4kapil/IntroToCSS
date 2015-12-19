/**
 * Created by erkap on 19-Dec-15.
 */
var launcher = require('simple-autoreload-server');

var server = launcher({
    port: 8686,
    root: './',
    listDirectory: true,
    watch: /\.(png|js|html|json)$/i
});