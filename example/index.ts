import {
  Widget
} from '@phosphor/widgets';

import {
  LifeWidget
} from '../src';


window.addEventListener('load', function () {
  const main = document.querySelector('main') as HTMLElement;
  const life = new LifeWidget({
    initial: LifeWidget.random(80, 120),
    interval: 100
  });

  Widget.attach(life, main);
  life.start();
});
