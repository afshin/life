import {
  Widget
} from '@phosphor/widgets';

import {
  LifeWidget
} from '../src';


window.addEventListener('load', function () {
  const main = document.querySelector('main') as HTMLElement;
  const life = (window as any).life = new LifeWidget({
    initial: LifeWidget.random(40, 120),
    interval: 50
  });

  Widget.attach(life, main);
  life.start();
});
