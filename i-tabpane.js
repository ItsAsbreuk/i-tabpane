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
        Event, Itag;

    if (!window.ITAGS[itagName]) {
        Event = require('event-mobile')(window);
        require('focusmanager')(window);
        require('i-item')(window);
        require('i-head')(window);

        Event.before(itagName+':manualfocus', function(e) {
            // the i-select itself is unfocussable, but its button is
            // we need to patch `manualfocus`,
            // which is emitted on node.focus()
            // a focus by userinteraction will always appear on the button itself
            // so we don't bother that
            var element = e.target;
            e.preventDefault();
            element.itagReady().then(
                function() {
                    var ul = element.getElement('>ul');
                    ul && ul.focus();
                }
            );
        });

        Event.after('focus', function(e) {
            var node = e.target,
                ul = node.getParent(),
                element = ul.getParent(),
                model = element.model,
                liNodes;
            liNodes = ul.getAll('li');
            model.pane = liNodes.indexOf(node) + 1;
        }, 'i-tabpane > ul li');

        Event.before(['tap', 'press'], function(e) {
            // don't double render (especially not BEFORE the tab changes)
            // rendering will be done because of the focus-event
            e.preventRender();
        }, 'i-tabpane > ul li');

        Itag = DOCUMENT.createItag(itagName, {
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
                    model = element.model,
                    pane = model.pane,
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
                        tabs[i] = '&nbsp;';
                    }
                    panes[panes.length] = node.getHTML();
                });

                element.setValueOnce('panes', panes);
                element.setValueOnce('tabs', tabs);

                // store its current value, so that valueChange-event can fire:
                element.setData('i-select-pane', pane);

                // note: the container wil excist of a div inside a div --> to make the css work (100% height within i-tabpane)
                content = '<ul fm-manage="li" fm-keyup="37" fm-keydown="39" fm-noloop="true"></ul><div><div class="container"></div></div>';
                // set the content:
                element.setHTML(content);
                element.setContentVisibility(true);
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
console.warn('syncing i-tabpane');
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
                    container = element.getElement('div.container'),
                    content = '',
                    i, tabItem, index;

                index = pane - 1;
                for (i=0; i<len; i++) {
                    tabItem = tabs[i];
                    if (i===index) {
                        content += '<li class="pure-button pure-button-active" fm-defaultitem="true"><div>'+tabItem+'</div></li>';
                    }
                    else {
                        content += '<li class="pure-button"><div>'+tabItem+'</div></li>';
                    }
                }

                // set the tabs:
                navContainer.setHTML(content, true);

                // set the content:
                // CANNOT be done silently: there can be itags within the pane
                container.setHTML(panes[index]);
            }
        });

        Itag.setItagDirectEventResponse('focus');

    }

    return window.ITAGS[itagName];

};