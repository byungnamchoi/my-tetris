if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

// https://github.com/Financial-Times/polyfill-service/tree/master/polyfills/Element/prototype/matches
if (!(document && document.documentElement && 'matches' in document.documentElement)) {
  Element.prototype.matches =
    Element.prototype.webkitMatchesSelector ||
    Element.prototype.oMatchesSelector ||
    Element.prototype.msMatchesSelector ||
    Element.prototype.mozMatchesSelector ||
    function matches(selector) {
      var element = this;
      var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
      var index = 0;

      while (elements[index] && elements[index] !== element) {
        ++index;
      }

      return !!elements[index];
    };
}

// https://github.com/Financial-Times/polyfill-service/tree/master/polyfills/Element/prototype/closest
if (!('closest' in document.documentElement)) {
  Element.prototype.closest = function(selector) {
    let node = this;

    while (node) {
      if (typeof node.matches === 'function' && node.matches(selector)) {
        return node;
      }
      node = node.parentNode;
    }

    return null;
  };
}

// https://github.com/Financial-Times/polyfill-service/tree/master/polyfills/Element/prototype/dataset
const hasFullSupport = (function() {
  if (!document.documentElement.dataset) {
    return false;
  }
  var el = document.createElement('div');
  el.setAttribute('data-a-b', 'c');
  return el.dataset && el.dataset.aB == 'c';
})();

if (!hasFullSupport) {
  Object.defineProperty(Element.prototype, 'dataset', {
    get: function() {
      var element = this;
      var attributes = this.attributes;
      var map = {};

      for (var i = 0; i < attributes.length; i++) {
        var attribute = attributes[i];

        if (attribute && attribute.name && /^data-\w[\w\-]*$/.test(attribute.name)) {
          var name = attribute.name;
          var value = attribute.value;

          var propName = name.substr(5).replace(/-./g, function(prop) {
            return prop.charAt(1).toUpperCase();
          });

          Object.defineProperty(map, propName, {
            enumerable: this.enumerable,
            get: function() {
              return this.value;
            }.bind({ value: value || '' }),
            set: function setter(name, value) {
              if (typeof value !== 'undefined') {
                this.setAttribute(name, value);
              } else {
                this.removeAttribute(name);
              }
            }.bind(element, name),
          });
        }
      }

      return map;
    },
  });
}

(function(arr) {
  arr.forEach(function(item) {
    if (item.hasOwnProperty('append')) {
      return;
    }
    Object.defineProperty(item, 'append', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function append() {
        var argArr = Array.prototype.slice.call(arguments),
          docFrag = document.createDocumentFragment();

        argArr.forEach(function(argItem) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });

        this.appendChild(docFrag);
      },
    });
  });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

(function(arr) {
  arr.forEach(function(item) {
    if (item.hasOwnProperty('prepend')) {
      return;
    }
    Object.defineProperty(item, 'prepend', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function prepend() {
        var argArr = Array.prototype.slice.call(arguments),
          docFrag = document.createDocumentFragment();

        argArr.forEach(function(argItem) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });

        this.insertBefore(docFrag, this.firstChild);
      },
    });
  });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);
