/*
* attributes:
* value, expanded, primary-button
*/
require('polyfill/polyfill-base.js');
require('js-ext/lib/string.js');
require('css');
require('./css/i-tabpane.css');

module.exports = function (window) {

    "use strict";
    require('itags.core')(window);

    var itagName = 'i-tabpane',
        DOCUMENT = window.document,
        Event;

    if (!window.ITAGS[itagName]) {
        Event = require('event-dom')(window);
        require('focusmanager')(window);
        require('i-item')(window);
        require('i-head')(window);

        Event.after('xfocus', function(e) {
            var element = e.target,
                model = element.model,
                liNodes;
            liNodes = element.getParent().getAll('li');
            model.pane = liNodes.indexOf(element) + 1;
        }, 'i-tabpane > ul li');

        DOCUMENT.createItag(itagName, {
            /*
             * Internal hash containing all DOM-events that are listened for (at `document`).
             *
             * @property DOMEvents
             * @default {}
             * @type Object
             * @private
             * @since 0.0.1
            */
            attrs: {
                pane: 'number'
            },

           /**
            * Redefines the childNodes of both the vnode as well as its related dom-node. The new
            * definition replaces any previous nodes. (without touching unmodified nodes).
            *
            * Syncs the new vnode's childNodes with the dom.
            *
            * @method _setChildNodes
            * @param newVChildNodes {Array} array with vnodes which represent the new childNodes
            * @private
            * @chainable
            * @since 0.0.1
            */
            init: function() {
                var element = this,
                    itemNodes = element.getAll('>i-item'),
                    panes = [],
                    tabs = [],
                    content;
                itemNodes.forEach(function(node, i) {
                    var header = node.getElement('i-head');
                    if (header) {
                        tabs[i] = header.getHTML();
                        header.remove(true);
                    }
                    else {
                        tabs[i] = '&laquo;';
                    }
                    panes[panes.length] = node.getHTML();
                });

                element.model.panes = panes;
                element.model.tabs = tabs;

                // store its current value, so that valueChange-event can fire:
                element.setData('i-select-pane', element.model.pane);

                content = '<ul fm-manage="li" fm-keyup="37" fm-keydown="39" fm-noloop="true"></ul><div></div>';
                // set the content:
                element.setHTML(content);
            },

           /**
            * Redefines the childNodes of both the vnode as well as its related dom-node. The new
            * definition replaces any previous nodes. (without touching unmodified nodes).
            *
            * Syncs the new vnode's childNodes with the dom.
            *
            * @method _setChildNodes
            * @param newVChildNodes {Array} array with vnodes which represent the new childNodes
            * @private
            * @chainable
            * @since 0.0.1
            */
            sync: function() {
                // inside sync, YOU CANNOT change attributes which are part of `attrs` !!!
                // those actions will be ignored.

                // BE CAREFUL to start async actions here:
                // be aware that before ending, this method can run again
                // if you do, then make sure to handle possible running
                // async actions well !!!

                var element = this,
                    model = element.model,
                    panes = model.panes,
                    pane = model.pane,
                    tabs = model.tabs,
                    len = tabs.length,
                    navContainer = element.getElement('>ul'),
                    container = element.getElement('>div'),
                    content = '',
                    i, tabItem, index;

                index = pane - 1;
                for (i=0; i<len; i++) {
                    tabItem = tabs[i];
                    content += '<li class="pure-button'+((i===index) ? ' pure-button-active' : '')+'">'+tabItem+'</li>';
                }

                // set the tabs:
                navContainer.setHTML(content);

                // set the content:
                container.setHTML(panes[index]);
            }
        });


    }

    return window.ITAGS[itagName];

};