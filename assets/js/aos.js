import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';
import mutationObserver from 'mutation-observer';
import { isMobile } from './device.js';
import { getOffset, getPosition } from './position.js';
import { addClass, removeClass } from './dom.js';

const DEFAULTS = {
  offset: 120,
  delay: 0,
  easing: 'ease',
  duration: 400,
  disable: false,
  once: false,
  startEvent: 'DOMContentLoaded',
  throttleDelay: 99,
  debounceDelay: 50,
  disableMutationObserver: false,
};

let animations = [];
let observer = null;
let enabled = true;

function init() {
  if (isMobile() || !enabled) return;

  animations = document.querySelectorAll('[data-aos]');
  startObserver();
  addAOSClasses();
}

function addAOSClasses() {
  animations.forEach((animation) => {
    addClass(animation, 'aos-init');
    const position = getPosition(animation);
    animation.setAttribute('data-aos-position', position);
  });
}

function startObserver() {
  if (observer || !enabled || isMobile() || !DEFAULTS.disableMutationObserver) return;

  observer = new mutationObserver(() => {
    if (isMobile()) return;
    addAOSClasses();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function handleAnimation(animation, direction) {
  if (!animation || !enabled || isMobile()) return;

  const aosDelay = animation.getAttribute('data-aos-delay');
  const aosDuration = animation.getAttribute('data-aos-duration');
  const aosEasing = animation.getAttribute('data-aos-easing');
  const aosOnce = animation.hasAttribute('data-aos-once');

  const delay = aosDelay ? parseInt(aosDelay, 10) : DEFAULTS.delay;
  const duration = aosDuration ? parseInt(aosDuration, 10) : DEFAULTS.duration;
  const easing = aosEasing ? aosEasing : DEFAULTS.easing;

  const animationStart =
    direction === 'entry'
      ? getOffset(animation).top - window.innerHeight - getOffset(document.body).top
      : getOffset(animation).top - getOffset(document.body).top;

  if (window.pageYOffset > animationStart - window.innerHeight && window.pageYOffset < animationStart + animation.offsetHeight) {
    if (direction === 'exit') {
      if (aosOnce) {
        removeAnimation(animation);
      } else {
        animation.classList.remove('aos-animate');
      }
    } else {
      animation.classList.add('aos-animate');
      animation.style.transition = `all ${duration}ms ${easing}`;
      animation.style.animationDuration = `${duration}ms`;
      animation.style.animationFillMode = 'both';
      animation.style.animationDelay = `${delay}ms`;
    }
  }
}

function removeAnimation(animation) {
  animation.removeAttribute('data-aos');
  animation.removeAttribute('data-aos-duration');
  animation.removeAttribute('data-aos-delay');
  animation.removeAttribute('data-aos-once');
  animation.removeAttribute('data-aos-easing');
  animation.removeAttribute('data-aos-id');
  animation.classList.remove('aos-init', 'aos-animate');
}

function refresh() {
  if (isMobile()) return;
  window.requestAnimationFrame(() => {
    addAOSClasses();
  });
}

function disable() {
  enabled = false;
  if (observer) observer.disconnect();
  animations.forEach((animation) => {
    removeAnimation(animation);
  });
}

function enable() {
  enabled = true;
  init();
}

const AOS = {
  init,
  refresh: throttle(refresh, DEFAULTS.throttleDelay),
  refreshHard: refresh,
  disable,
  enable,
};

export default AOS;


export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}


export function getOffset(element) {
  const rect = element.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
  };
}

export function getPosition(element) {
  const offset = getOffset(element);
  const bodyOffset = getOffset(document.body);
  return offset.top - bodyOffset.top;
}


export function addClass(element, className) {
  if (element.classList) {
    element.classList.add(className);
  } else {
    element.className += ' ' + className;
  }
}

export function removeClass(element, className) {
  if (element.classList) {
    element.classList.remove(className);
  } else {
    element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }
}
