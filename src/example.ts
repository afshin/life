import { Life } from '.';
import { Widget } from '@lumino/widgets';

window.addEventListener('load', function () {
  const main = document.querySelector('main') as HTMLElement;
  const model = (window as any).model = new Life.Model({
    initial: Life.Model.random(50, 100),
    interval: 100
  });

  Widget.attach(Life.create(model, { size: 10 }), main);
  model.start();
});
