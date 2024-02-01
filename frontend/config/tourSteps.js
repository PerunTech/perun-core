import React from 'react'

export const moduleSteps = [{
  step: 1,
  position: 'bottom',
  selector: '#search',
  title: <div>Избор на модул</div>,
  body: <div>Со клкинување на било кој од прикажаните модули, ќе бидете пренаочени кон соодветниот дел од системот задолжен за извршување на задачите кои се во опсег на модулот.</div>
}]

export const searchSteps = [{
  step: 1,
  position: 'bottom',
  selector: '.searchDiv',
  title: <div>Пребарување на апликант</div>,
  body: <div>Со оваа форма се овозможува пребарување на апликант според неколку параметри.</div>
}, {
  step: 2,
  position: 'bottom',
  selector: '.datagridContent',
  title: <div>Резултати од пребарување</div>,
  body: <div>Со кликнување на некој од резултатите од пребарувањето, со врши избор на тој апликант и
    се прикажуваат сите информации во системот за истиот.</div>
}, {
  step: 3,
  position: 'bottom',
  selector: '#HELP_nav_top',
  title: <div>Помош и одјава</div>,
  body: <div>Копчињата за помош и одјава ќе Ви бидат цело време достапни. Доколку во било кое време сакате помошта да не се прикажува,
    кликнете на копчето „Помош“ за да ја деактивирате.</div>
}]

export const farmerSteps = [{
  step: 1,
  position: 'right',
  selector: '#toggleInfoHolder',
  title: <div>Податоци за апликант</div>,
  body: <div>Со позиционирање на глувчето врз ова поле се прикажуваат основните податоци за одбраниот апликант.</div>
}, {
  step: 2,
  position: 'bottom',
  selector: '#redux_nav_list',
  title: <div>Навигациско мени</div>,
  body: <div>Користете го ова мени за навигација низ апликацијата.</div>
}, {
  step: 3,
  position: 'bottom',
  selector: '#FARMER_nav_top',
  title: <div>Податочно мени</div>,
  body: <div>Користете го ова мени за да прегледувате и внесувате податоци за апликантот.</div>
}, {
  step: 4,
  position: 'bottom',
  selector: '.react-grid-Toolbar',
  title: <div>Приказ на податоци</div>,
  body: <div>Овде се прикажуват информациите од податочното мени, користејќи тебеларен приказ</div>
}, {
  step: 5,
  position: 'bottom',
  selector: '#APPLICATION_nav_top',
  title: <div>Барања</div>,
  body: <div>При кликнување на копчето „Барања“ и одбирање на едно од барањата прикажани подолу,
    ќе Ви бидат прикажани информациите и податоците за истото.</div>
}, {
  step: 6,
  position: 'bottom',
  selector: '.react-grid-Toolbar',
  title: <div>Креирање и филтрирање на барања</div>,
  body: <div>Сите функционалности поврзани со табеларните податоци се наоѓаат во ова поле. Копчето за филтрирање на редици
    е достапно за секој тип на податок кој се прикажува во табеларен формат.
    Дополнителни функционалности како „Додавање“ се достапни само за одредени типови на податоци, за одредени апликанти
    и одредени барањa (зависно од параметрите како статус, тип на корисник, итн...).
  </div>
}, {
  step: 7,
  position: 'bottom',
  selector: '.react-grid-Canvas:last-child',
  title: <div>Избор на барање</div>,
  body: <div>Кликнете на некое од барањата во табелата за да ги прегледате дополнителнте информации за него.</div>
}]

export const applicationSteps = [{
  step: 1,
  position: 'right',
  selector: '#toggleInfoHolder',
  title: <div>Податоци за барање</div>,
  body: <div>Со позиционирање на глувчето врз ова поле се прикажуваат основните податоци за одбраниот апликант и одбраното барање.</div>
}, {
  step: 2,
  position: 'right',
  selector: '#APPLICATION_DETAILS_nav_top',
  title: <div>Детали за барање</div>,
  body: <div>Со кликнување на ова копче, од левата страна,
    под податоците за апликант и барање ќе се прикаже дополнително мени со дополнителни податоци за барањето.</div>
}, {
  step: 3,
  position: 'right',
  selector: '#APPLICATION_MEASURES_nav_top',
  title: <div>Типови на мерки</div>,
  body: <div>Со поминување на глувчето врз ова копче,
    ќе Ви биде прикажано дополнително мени од кое можете да изберете за кои мерки да се прикажуваат податоци.</div>
}, {
  step: 4,
  position: 'right',
  selector: '#APPLICATION_TRANSITION_nav_top',
  title: <div>Промена на статус на барање</div>,
  body: <div>Со поминување на глувчето врз ова копче,
    ќе Ви биде прикажано дополнително мени со можни статуси во кои вашето барање може да премине (на пр. поднесување)</div>
}, {
  step: 5,
  position: 'right',
  selector: '#APPLICATION_PRINT_nav_top',
  title: <div>Печатење</div>,
  body: <div>Преку менито овозможено од ова копче,
    можете да прегледате различни верзии за печатење на вашето барање.</div>
}, {
  step: 6,
  position: 'right',
  selector: '#sidemenu_list',
  title: <div>Дополнителни податоци</div>,
  body: <div>Одредени копчиња од податочното мени (на пр. „Мерки“),
    креираат дополнително мени со податоци кое се прикажува овде.</div>
}]
