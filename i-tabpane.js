/*
* attributes:
* value, expanded, primary-button
*/
require('polyfill/polyfill-base.js');
require('js-ext/lib/string.js');
require('css');
require('./css/i-tabpane.css');

var TRANS_TIME_SHOW = 0.3,
    TRANS_TIME_HIDE = 0.1,
    CLASS_ITAG_RENDERED = 'itag-rendered';

module.exports = function (window) {

    "use strict";
    require('itags.core')(window);

    var itagName = 'i-tabpane',
        Event;

    if (!window.ITAGS[itagName]) {
        Event = require('event-dom')(window);
        // require('focusmanager')(window);
        require('i-item')(window);
        require('i-head')(window);

        window.document.createItag('i-tabpane');
    }


};