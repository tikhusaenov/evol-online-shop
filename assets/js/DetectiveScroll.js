/**
 * DetectiveScroll
 * Плагин остлеживает скролл и может переключать классы в зависимости от высоты скролла
 *
 * new DetectiveScroll({
     trigger: {
       el: $('.js-scroll_top'),
       scroll: $(window).height() / 3
     }
   })

   // если нужна задержка или вызов своих коллбеков
   new DetectiveScroll({
     wait: 300,
     onUpdate: function(scrollTop){
       console.log(scrollTop);
     },
     trigger: {
       el: $('.js-scroll_top'),
       scroll: $(window).height() / 3
     }
   })
*/

function DetectiveScroll(options) {
  var MiniEventBus = function () {
    var $bus = $({});
    this.subscribe = function (eventHandler_name, eventHandler_handler) {
      $bus.bind(eventHandler_name, eventHandler_handler);
    };

    this.unsubscribe = function (eventHandler) {
      $bus.unbind(eventHandler.name);
    };

    this.throwEvent = function (event_name, event_args) {
      setTimeout(function () {
        $bus.trigger(event_name, [event_args]);
      }, 0);
    };
  };

  var self = this;
  var html = document.documentElement;
  var body = document.body;
  self.eventBus = new MiniEventBus;

  /**
   * trigger
   * {
   *  el: $('.my-element'),
   *  enabled: 'is-enabled',
   *  disabled: 'is-disabled',
   *  scroll: 300
   * }
   *
   * scroll - после какой высоты скролла добавить enabled
   */

  var DEFAULT_OPTIONS = {
    wait: null,
    onUpdate: function(){},
    trigger: {}
  }

  var defaultTrigger = {
    enabled: 'is-enabled',
    disabled: 'is-disabled',
    scroll: 300
  }

  self.options = extendObject(DEFAULT_OPTIONS, options);

  self.init = function () {
    var wait = self.options.wait;

    if (wait) {
      window.addEventListener('scroll', throttle(_handler, wait));
      window.addEventListener('resize', throttle(_handler, wait));
    }else{
      window.addEventListener('scroll', _handler);
      window.addEventListener('resize', _handler);
    }

    _handler()
  }

  self.initTrigger = function () {
    var $trigger = self.options.trigger.el;
    var triggerOptions = extendObject(defaultTrigger, self.options.trigger);

    if ($trigger) {
      self.eventBus.subscribe('onUpdateSystem', function (event, scroll) {
        if (triggerOptions.scroll >= scroll) {
          $trigger.addClass(triggerOptions.disabled).removeClass(triggerOptions.enabled);
        }else{
          $trigger.addClass(triggerOptions.enabled).removeClass(triggerOptions.disabled);
        }
      })
    }
  }

  function _handler() {
    _requestAnimationFrame(function () {
      var scrollTop = Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop);
      scrollTop -= document.documentElement.clientTop;
      self.options.onUpdate(scrollTop);
      self.eventBus.throwEvent('onUpdateSystem', scrollTop);
    })
  }

  // UTIL
  function extendObject (defaults, options) {
    var extended = {};
    var prop;
    for (prop in defaults) {
      if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
        extended[prop] = defaults[prop];
      }
    }
    for (prop in options) {
      if (Object.prototype.hasOwnProperty.call(options, prop)) {
        extended[prop] = options[prop] || defaults[prop];
      }
    }
    return extended;
  };

  function throttle(fn, wait) {
    var time = Date.now();
    return function() {
      if ((time + wait - Date.now()) < 0) {
        fn();
        time = Date.now();
      }
    }
  }

  _requestAnimationFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60)
  }

  self.init();
  self.initTrigger();
}
