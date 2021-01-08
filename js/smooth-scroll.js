/*

smooth-scroll — javaScript plugin
Version: 1.0.0
Author: Aleksey Pilipenko (marvin777xd@yandex.ru)

*/

function setSmoothScroll() {
    if ('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch) return;

    var scrollTypes = ['vertical', 'horizontal'];

    var options = {
        container: document.documentElement,
        scrollType: scrollTypes[0],
        friction: 0.95,
        stepAmount: 1
    };

    if (arguments[0] && type(arguments[0]) === 'Object') {
        var optionsArg = arguments[0];
        
        if ('container' in optionsArg) {
            if (!optionsArg.container || !optionsArg.container.length) {
                console.error('container not found');

                return;
            }
        }

        if ('scrollType' in optionsArg) {
            if (scrollTypes.indexOf(optionsArg.scrollType) === -1) {
                console.error('wrong type of scroll');

                return;
            }
        }

        options = deepExtend(options, optionsArg);
    }

    if (!('smoothScroll' in window)) {
        window.smoothScroll = {};
        window.smoothScroll.activeElement = null;
        window.smoothScroll.options = new WeakMap();
    }

    var supportsPassive = false;

    try {
        var testPassiveOptions = Object.defineProperty({}, 'passive', {
            get: function() {
                supportsPassive = true;
            }
        });

        window.addEventListener('testPassive', null, testPassiveOptions);
        window.removeEventListener('testPassive', null, testPassiveOptions);
    } catch(err) {}

    [].forEach.call(type(options.container) === 'NodeList' ? options.container : [options.container], function(container) {
        var scrollProp = options.scrollType === 'horizontal' ? 'scrollLeft' : 'scrollTop';
        var currentScroll = 0;
        var delta = 0;
        var minMovement = 0.1;
        var direction = '';

        window.smoothScroll.options.set(container, {
            animate: true,
            scroll: 0
        });

        function updateScroll() {
            window.smoothScroll.options.get(container).scroll += delta * options.stepAmount;
        }

        function scrollAnimation() {
            if (!window.smoothScroll.options.get(container).animate) return;

            if (window.smoothScroll.options.get(container).scroll < -minMovement 
                || window.smoothScroll.options.get(container).scroll > minMovement) {
                window.smoothScroll.options.get(container).scroll *= options.friction;
                currentScroll -= window.smoothScroll.options.get(container).scroll;

                container[scrollProp] = currentScroll;
            }
        }

        function animateLoop() {
            window.requestAnimationFrame(animateLoop);
            scrollAnimation();
        }

        animateLoop();

        function onWheel(event) {
            if (event.ctrlKey) return;

            event.preventDefault();

            var scrollSize = options.scrollType === 'horizontal' ? container.scrollWidth - container.clientWidth : container.scrollHeight - container.clientHeight;
            var dir;

            delta = event.detail ? event.detail * -1 : event.wheelDelta / 40;
            dir = delta < 0 ? 'down' : 'up';

            if (dir !== direction) {
                window.smoothScroll.options.get(container).scroll = 0;
                direction = dir;
            }

            if (direction === 'down' && (Math.floor(this[scrollProp]) === scrollSize || Math.ceil(this[scrollProp]) === scrollSize)
                || direction === 'up' && this[scrollProp] === 0) {
                window.smoothScroll.options.get(this).animate = false;
            } else {
                event.stopPropagation();
                window.smoothScroll.options.get(this).animate = true;
            }

            if (window.smoothScroll.options.get(this).animate) {
                if (this !== window.smoothScroll.activeElement) {
                    if (window.smoothScroll.activeElement && window.smoothScroll.activeElement.contains(this)) {
                        window.smoothScroll.options.get(window.smoothScroll.activeElement).animate = false;
                        window.smoothScroll.options.get(window.smoothScroll.activeElement).scroll = 0;
                    }

                    window.smoothScroll.activeElement = this;
                }

                currentScroll = this[scrollProp];
                updateScroll();
            }
        }

        container.addEventListener('mousewheel', onWheel,  supportsPassive ? { passive: false } : false);
        container.addEventListener('DOMMouseScroll', onWheel,  supportsPassive ? { passive: false } : false);
    });

    function deepExtend(out) {
        out = out || {};

        for (var i = 1, length = arguments.length; i < length; ++i) {
            var obj = arguments[i];

            if(!obj) {
                continue;
            }

            for(var key in obj) {
                if (!Object.prototype.hasOwnProperty.call(obj, key)) {
                    continue;
                }

                if (type(obj[key]) === 'Object') {
                    out[key] = deepExtend(out[key], obj[key]);

                    continue;
                }

                out[key] = obj[key];
            }
        }
        
        return out;
    }

    function type(value) {
        return Object.prototype.toString.call(value).match(/^\[object (\S+?)]$/)[1] || 'undefined';
    }
}
