import {
  Widget
} from '@phosphor/widgets';

import {
  createLife, LifeDataModel
} from '../src';


window.addEventListener('load', function () {
  const main = document.querySelector('main') as HTMLElement;
  const model = (window as any).model = new LifeDataModel({
    initial: LifeDataModel.random(100, 100),
    interval: 50
  });
  const grid = createLife(model);

  Widget.attach(grid, main);
  model.start();
});
