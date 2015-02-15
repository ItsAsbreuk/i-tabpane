/*
* attributes:
* value, expanded, primary-button
*/

require('./css/i-tabpane.css');

module.exports = function (window) {

    "use strict";

    var itagName = 'i-tabpane',
        itagCore = require('itags.core')(window),
        DOCUMENT = window.document,
        ITSA = window.ITSA,
        Event = ITSA.Event,
        Itag;

    if (!window.ITAGS[itagName]) {

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
                pane: 'number',
                'reset-value': 'string',
                'i-prop': 'string'
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
                    designNode = element.getDesignNode(),
                    itemNodes = designNode.getAll('>section'),
                    model = element.model,
                    pane = model.pane,
                    panes = [],
                    tabs = [],
                    content;
                itemNodes.forEach(function(node, i) {
                    var header = node.getElement('span[is="tab"]');
                    if (header) {
                        tabs[i] = header.getHTML();
                    }
                    else {
                        tabs[i] = '&nbsp;';
                    }
                    panes[panes.length] = node.getHTML(header);
                });

                element.defineWhenUndefined('panes', panes)
                       .defineWhenUndefined('tabs', tabs)
                        // set the reset-value to the inital-value in case `reset-value` was not present
                       .defineWhenUndefined('reset-value', pane);

                // store its current value, so that valueChange-event can fire:
                element.setData('i-select-pane', pane);

                // note: the container wil excist of a div inside a div --> to make the css work (100% height within i-tabpane)
                content = '<ul fm-manage="li" fm-keyup="37" fm-keydown="39" fm-noloop="true"></ul><div><div class="container"></div></div>';
                // set the content:
                element.setHTML(content);
            },

            currentToReset: function() {
                var model = this.model;
                model['reset-value'] = model.pane;
            },

            reset: function() {
                var model = this.model;
                model.pane = model['reset-value'];
                // no need to call `refreshItags` --> the reset()-method doesn't come out of the blue
                // so, the eventsystem will refresh it afterwards
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

        itagCore.setDirectEventResponse(Itag, 'focus');
        itagCore.setContentVisibility(Itag, true);

        window.ITAGS[itagName] = Itag;
    }

    return window.ITAGS[itagName];

};