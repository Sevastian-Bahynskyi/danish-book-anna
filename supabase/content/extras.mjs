// Chapter material that goes around Anna's phrase lists (source.txt).
// Phrases themselves are parsed from source.txt; everything here is keyed by chapter number.
//
// explain:   { phraseNumber: "пояснення" }   shown behind the "Пояснення" button
// dialogues: [{ title, lines: [[who, da, ua, me?]] }]   me = Anna's side
// exercises: [{ q, options: [correct, wrong, wrong], why? }]   order is shuffled at build time

export const CHAPTERS = {
  1: {
    intro: "Повідомити про хворобу данською простіше, ніж здається. Данці пишуть коротко: що сталося і коли приблизно повернетеся. Без довгих пояснень і вибачень.",
    explain: {
      1: "Найуніверсальніша фраза. Підходить і для SMS, і для дзвінка.",
      3: "«Blive nødt til» означає «бути змушеною». Дуже частий вираз: jeg bliver nødt til at gå, jeg bliver nødt til at ringe.",
      15: "Іноді роботодавець просить підтвердження від лікаря (lægeerklæring). Уточніть, які правила діють на вашій роботі.",
      16: "Varsel означає попередження. Цю фразу добре додати, якщо пишете зранку в останній момент.",
      17: "«Melde sig syg» це стійкий вираз, саме так кажуть данці. Дослівно: «заявляю себе хворою». Є й протилежне: «melde sig rask», тобто повідомити, що ви знову здорові.",
      20: "«Regne med» означає розраховувати, планувати. Звучить впевнено, але не як обіцянка.",
    },
    dialogues: [
      { title: "Дзвінок начальнику зранку", lines: [
        ["Anna", "Godmorgen, det er Anna. Jeg ringer for at melde mig syg.", "Доброго ранку, це Анна. Я телефоную, щоб повідомити, що захворіла.", true],
        ["Chef", "Åh, det var ærgerligt. Hvad er der galt?", "Ой, шкода. Що сталося?"],
        ["Anna", "Jeg har feber og ondt i halsen.", "У мене температура і болить горло.", true],
        ["Chef", "Okay. Hvornår forventer du at være tilbage?", "Добре. Коли ти очікуєш повернутися?"],
        ["Anna", "Jeg håber at være tilbage i morgen. Jeg giver besked, hvis noget ændrer sig.", "Сподіваюся повернутися завтра. Я повідомлю, якщо щось зміниться.", true],
        ["Chef", "Fint. God bedring!", "Добре. Одужуй!"],
      ]},
      { title: "Стало погано на роботі", lines: [
        ["Anna", "Undskyld, jeg er blevet dårlig i løbet af dagen.", "Вибач, мені стало погано протягом дня.", true],
        ["Chef", "Du ser heller ikke så godt ud. Har du brug for at gå hjem?", "Ти й справді не дуже добре виглядаєш. Тобі треба піти додому?"],
        ["Anna", "Ja. Er det okay, at jeg går hjem?", "Так. Чи можна мені піти додому?", true],
        ["Chef", "Selvfølgelig. Pas på dig selv.", "Звісно. Бережи себе."],
      ]},
    ],
    notes: [
      "Данці повідомляють про хворобу дуже коротко, без довгих пояснень. Не потрібно розповідати всі симптоми. Достатньо сказати «Jeg melder mig syg i dag» і коли приблизно повернетеся. Це звучить нормально й професійно, а не грубо.",
      "Фраза «God bedring!» означає «Одужуй!». Ви почуєте її майже завжди, коли скажете, що захворіли. Відповісти можна просто: «Tak!»",
    ],
    mistakes: [
      ["Jeg er syk i dag.", "Jeg er syg i dag.", "«Syk» це норвезька. Данською буде «syg», а «g» в кінці майже не чутно."],
      ["Jeg har en feber.", "Jeg har feber.", "Про хворобу данці кажуть без артикля: jeg har feber, jeg har hovedpine, jeg har ondt i halsen."],
      ["Jeg føler mig ikke godt.", "Jeg har det ikke godt.", "Про самопочуття данці кажуть «Jeg har det godt / ikke godt», дослівно «я маю це добре». Звучить незвично, але саме так природно."],
    ],
    messages: [
      ["Керівнику, SMS зранку", "Hej, jeg er desværre syg i dag og kan ikke komme på arbejde. Jeg giver besked, når jeg ved mere.", "Привіт, на жаль, я сьогодні хвора і не можу прийти на роботу. Я повідомлю, коли знатиму більше."],
      ["Керівнику, другий день", "Hej, jeg er stadig syg og bliver hjemme i dag. Jeg regner med at være tilbage i morgen.", "Привіт, я все ще хвора і сьогодні залишаюся вдома. Планую повернутися завтра."],
      ["Колегам, коли повернулися", "Hej alle sammen, jeg er tilbage i dag. Tak, fordi I dækkede for mig.", "Привіт усім, я сьогодні повернулася. Дякую, що підмінили мене."],
    ],
    exercises: [
      { q: "Що сказати начальнику, якщо ти захворіла?", options: ["Jeg er syg.", "Jeg har ferie.", "Jeg kommer tidligere."] },
      { q: "Як сказати «У мене болить голова»?", options: ["Jeg har hovedpine.", "Jeg har ondt i halsen.", "Jeg har feber."] },
      { q: "Як природно сказати «Я сьогодні погано почуваюся»?", options: ["Jeg har det ikke godt i dag.", "Jeg føler mig ikke godt i dag.", "Jeg er ikke god i dag."], why: "Про самопочуття кажуть «Jeg har det godt / ikke godt»." },
      { q: "Колега каже вам «God bedring!». Що це означає?", options: ["Одужуй!", "Гарного дня!", "Побачимося завтра!"] },
    ],
    vocab: [["syg","хворий, хвора"],["sygdom","хвороба"],["fravær","відсутність"],["feber","температура"],["hovedpine","головний біль"],["ondt i halsen","біль у горлі"],["læge","лікар"],["lægetid","прийом у лікаря"],["god bedring","одужуй"],["varsel","попередження"]],
  },

  2: {
    intro: "Графік змін, перерви, запізнення і вихідні. Тут фрази, щоб домовитися про час без стресу, і слова, які ви точно побачите у vagtplan.",
    explain: {
      7: "«Bytte» означає обмінятися. «Bytte vagt» це поміняти зміну з колегою. Дуже часто так кажуть у магазинах, лікарнях і на складах.",
      12: "Перерва може бути оплачуваною (betalt pause) або ні (ubetalt pause). Це залежить від вашого договору.",
      16: "Датське «Jeg er på vej» дуже зручне в повсякденному спілкуванні. Його можна використовувати, коли ви вже виходите, їдете або прямуєте кудись. Не обов'язково перекладати дослівно як «я на шляху».",
      22: "«Have fri» означає мати вихідний. «Fridag» це вихідний день.",
    },
    dialogues: [
      { title: "Помінятися зміною", lines: [
        ["Anna", "Hej Mette, kan du bytte vagt med mig på fredag?", "Привіт, Метте, можеш помінятися зі мною зміною в п'ятницю?", true],
        ["Mette", "Hvilken vagt har du?", "Яка в тебе зміна?"],
        ["Anna", "Jeg har aftenvagt fra 16 til 22.", "У мене вечірня зміна з 16 до 22.", true],
        ["Mette", "Det kan jeg godt. Tager du så min morgenvagt på lørdag?", "Я можу. Тоді візьмеш мою ранкову зміну в суботу?"],
        ["Anna", "Ja, det passer fint. Tak! Jeg skriver det til chefen.", "Так, мені підходить. Дякую! Я напишу про це начальнику.", true],
      ]},
      { title: "Запізнююся", lines: [
        ["Anna", "Hej, jeg er lidt forsinket. Bussen er ikke kommet.", "Привіт, я трохи запізнююся. Автобус не приїхав.", true],
        ["Chef", "Okay, hvornår er du her?", "Добре, коли ти будеш?"],
        ["Anna", "Om cirka ti minutter.", "Приблизно за десять хвилин.", true],
        ["Chef", "Fint, tak for besked.", "Добре, дякую, що повідомила."],
      ]},
    ],
    notes: [
      "Якщо запізнюєтеся, напишіть заздалегідь, навіть якщо це 5 хвилин. У Данії цінують, коли попереджають. Коротко: «Jeg er lidt forsinket, jeg er her om 10 minutter.» Цього достатньо.",
    ],
    mistakes: [
      ["Jeg er sen.", "Jeg er forsinket.", "«Sen» означає «пізній», але про запізнення кажуть «forsinket». «Jeg kommer for sent» теж правильно."],
      ["Kan jeg ændre vagt med dig?", "Kan jeg bytte vagt med dig?", "«Ændre» означає змінити щось. Помінятися зміною з кимось: «bytte vagt med nogen»."],
      ["Jeg arbejder på weekenden.", "Jeg arbejder i weekenden.", "З weekend данці вживають «i»: i weekenden, i dag, i morgen. «På» ставлять з днями тижня: på mandag."],
    ],
    messages: [
      ["Керівнику, запізнення", "Hej, jeg er lidt forsinket i dag, men jeg er på vej.", "Привіт, я сьогодні трохи запізнююся, але вже в дорозі."],
      ["Керівнику, графік", "Hej, kan du sende mig vagtplanen for næste uge?", "Привіт, можеш надіслати мені графік на наступний тиждень?"],
      ["Колезі, обмін змінами", "Hej! Har du mulighed for at bytte vagt med mig på fredag? Jeg kan tage en af dine vagter i stedet.", "Привіт! Чи можеш помінятися зі мною зміною в п'ятницю? Я можу взяти замість цього одну з твоїх змін."],
    ],
    exercises: [
      { q: "Як сказати «Я вже в дорозі»?", options: ["Jeg er på vej.", "Jeg er på arbejde.", "Jeg er her nu."] },
      { q: "Ви хочете помінятися зміною з колегою. Що скажете?", options: ["Kan jeg bytte vagt med dig?", "Kan jeg tage en pause?", "Hvornår slutter min vagt?"] },
      { q: "Що означає «Jeg har fri i morgen»?", options: ["У мене завтра вихідний", "Завтра я працюю", "Завтра я вільна тільки після роботи"] },
      { q: "Як сказати «Я трохи запізнююся»?", options: ["Jeg er lidt forsinket.", "Jeg er lidt sen.", "Jeg er lidt tidlig."] },
    ],
    vocab: [["vagt","зміна"],["vagtplan","графік змін"],["morgenvagt","ранкова зміна"],["aftenvagt","вечірня зміна"],["nattevagt","нічна зміна"],["pause","перерва"],["have fri","мати вихідний"],["bytte","помінятися"],["forsinket","той, хто запізнюється"],["overarbejde","понаднормова робота"]],
  },

  3: {
    intro: "Коли начальник швидко пояснює завдання, найважливіше не боятися перепитати. У Данії це нормально і навіть цінується: краще перепитати, ніж зробити неправильно.",
    explain: {
      6: "Ця фраза рятує в будь-якій розмові. Додайте «undskyld» на початку, і вона звучатиме ще м'якше: «Undskyld, kan du tale lidt langsommere?»",
      12: "Після цього запитання коротко повторіть завдання своїми словами. Так ви і перевірите себе, і покажете, що уважно слухали.",
      23: "Маленьке слово «lige» данці вживають постійно. Воно пом'якшує фразу: «зараз, швиденько». Jeg prøver lige = я зараз спробую.",
      25: "«Endelig» тут не означає «нарешті». У фразі «sig endelig til» це «обов'язково, будь ласка». Дуже ввічливо і дружньо.",
    },
    dialogues: [
      { title: "Нове завдання на складі", lines: [
        ["Chef", "Kan du rydde op på lageret og tjekke de nye varer?", "Можеш прибрати на складі і перевірити нові товари?"],
        ["Anna", "Ja. Hvad skal jeg lave først?", "Так. Що мені зробити спочатку?", true],
        ["Chef", "Tjek varerne først, og ryd så op bagefter.", "Спочатку перевір товари, а потім прибери."],
        ["Anna", "Har jeg forstået det rigtigt: først varerne, så lageret?", "Я правильно зрозуміла: спочатку товари, потім склад?", true],
        ["Chef", "Præcis.", "Саме так."],
        ["Anna", "Hvor skal jeg lægge de nye varer?", "Куди мені покласти нові товари?", true],
        ["Chef", "På hylden ved døren.", "На полицю біля дверей."],
      ]},
    ],
    notes: [
      "Не соромтеся перепитувати. Данські керівники зазвичай пояснюють коротко і чекають, що ви запитаєте, якщо щось незрозуміло. Мовчки кивнути і зробити неправильно гірше, ніж запитати ще раз.",
      "Слово «lige» ви чутимете щодня: «Kan du lige komme?», «Jeg skal lige…». Воно робить прохання м'якшим. Спробуйте і ви його додавати.",
    ],
    mistakes: [
      ["Jeg forstår ikke dig.", "Jeg forstår dig ikke.", "Коли після дієслова стоїть коротке слово на кшталт dig, det, ham, «ikke» ставиться після нього: Jeg forstår dig ikke. Jeg kender ham ikke."],
      ["Kan du forklare mig igen?", "Kan du forklare det igen?", "Після «forklare» потрібно сказати, що саме пояснити: forklare det, forklare opgaven."],
      ["Jeg er færdig med denne opgaven.", "Jeg er færdig med denne opgave.", "Після «denne» слово стоїть без закінчення -en: denne opgave, dette spørgsmål."],
    ],
    messages: [
      ["Керівнику, не зрозуміла завдання", "Hej, jeg er ikke helt sikker på, at jeg har forstået opgaven. Kan du forklare den igen?", "Привіт, я не зовсім впевнена, що правильно зрозуміла завдання. Можеш пояснити його ще раз?"],
      ["Керівнику, завдання виконано", "Hej, jeg er færdig med opgaven. Hvad skal jeg tage fat på nu?", "Привіт, я закінчила завдання. За що мені взятися зараз?"],
      ["Колезі, потрібна допомога", "Hej, har du to minutter? Jeg har brug for lidt hjælp med systemet.", "Привіт, маєш дві хвилинки? Мені потрібна невелика допомога з системою."],
    ],
    exercises: [
      { q: "Начальник говорить занадто швидко. Що скажете?", options: ["Kan du tale lidt langsommere?", "Kan du komme et øjeblik?", "Hvor finder jeg det?"] },
      { q: "Як перевірити, чи ви правильно зрозуміли?", options: ["Har jeg forstået det rigtigt?", "Er det dit?", "Hvad laver du?"] },
      { q: "Що означає «Sig endelig til»?", options: ["Обов'язково скажи", "Скажи нарешті", "Скажи потім"], why: "«Endelig» у цій фразі означає «обов'язково, будь ласка»." },
      { q: "Як сказати «Я майже закінчила»?", options: ["Jeg er næsten færdig.", "Jeg er helt færdig.", "Jeg er ikke færdig."] },
    ],
    vocab: [["opgave","завдання"],["instruktion","інструкція"],["forklare","пояснювати"],["forstå","розуміти"],["vise","показувати"],["færdig","готово, закінчено"],["først","спочатку"],["bagefter","потім"],["rigtigt","правильно"],["forkert","неправильно"]],
  },

  4: {
    intro: "На зустрічах данці говорять спокійно і чекають, що кожен може висловитися. Тут фрази, щоб поставити запитання, погодитися, сказати свою думку або попросити повторити.",
    explain: {
      6: "«Jeg vil gerne» це найввічливіший спосіб сказати «я хотіла б». Використовуйте його замість «jeg vil», яке звучить різкіше.",
      18: "Хороший спосіб перепитати на зустрічі, не перебиваючи. Після неї коротко повторіть, що ви зрозуміли.",
      23: "«Vende tilbage» дослівно «повернутися», але в роботі це означає «відповім пізніше». Дуже корисно, коли потрібен час подумати.",
    },
    dialogues: [
      { title: "Запитання на зустрічі", lines: [
        ["Leder", "Er der nogen, der har spørgsmål?", "Хтось має запитання?"],
        ["Anna", "Ja, jeg har et spørgsmål. Hvornår skal det være færdigt?", "Так, у мене є запитання. Коли це має бути готово?", true],
        ["Leder", "Inden fredag.", "До п'ятниці."],
        ["Anna", "Og hvem tager sig af kunderne?", "А хто займатиметься клієнтами?", true],
        ["Leder", "Det gør Lars. Er det okay?", "Ларс. Це нормально?"],
        ["Anna", "Ja, det giver mening. Jeg skriver det ned.", "Так, це має сенс. Я це запишу.", true],
      ]},
    ],
    notes: [
      "На данських зустрічах нормально мовчати, поки слухаєте, і нормально сказати «Jeg er ikke helt sikker». Ніхто не чекає, що ви одразу маєте готову думку. Фраза «Jeg vender tilbage med et svar» дає вам час подумати.",
    ],
    mistakes: [
      ["Jeg har enig.", "Jeg er enig.", "«Бути згодною» данською «være enig», з дієсловом «være», а не «have»."],
      ["Kan du repetere det?", "Kan du gentage det?", "«Repetere» кажуть про повторення матеріалу при навчанні. Попросити повторити сказане: «Kan du gentage det?»"],
      ["Jeg vil tilføje noget.", "Jeg vil gerne tilføje noget.", "Без «gerne» фраза звучить як вимога. «Gerne» робить її ввічливою."],
    ],
    messages: [
      ["Колегам, після зустрічі", "Hej alle, tak for mødet i dag. Jeg sender mine noter senere.", "Привіт усім, дякую за сьогоднішню зустріч. Я надішлю свої нотатки пізніше."],
      ["Керівнику, перенести зустріч", "Hej, kan vi flytte vores møde til i morgen? Jeg har desværre en lægetid i dag.", "Привіт, можемо перенести нашу зустріч на завтра? На жаль, у мене сьогодні прийом у лікаря."],
    ],
    exercises: [
      { q: "Як ввічливо сказати «Я хотіла б щось додати»?", options: ["Jeg vil gerne tilføje noget.", "Jeg tilføjer noget nu.", "Jeg har noget."] },
      { q: "Як попросити повторити?", options: ["Kan du gentage det?", "Kan du skrive det?", "Kan du tage det?"] },
      { q: "«Jeg vender tilbage med et svar» означає:", options: ["Я відповім пізніше", "Я повернуся на роботу", "Я не знаю відповіді"] },
      { q: "Як сказати «Я згодна»?", options: ["Jeg er enig.", "Jeg har enig.", "Jeg enig."] },
    ],
    vocab: [["møde","зустріч"],["samtale","розмова"],["spørgsmål","запитання"],["svar","відповідь"],["enig","згодна, згоден"],["forslag","пропозиція"],["punkt","пункт"],["referat","протокол зустрічі"],["deadline","крайній термін"],["næste skridt","наступний крок"]],
  },

  5: {
    intro: "Розмова з керівником у Данії зазвичай менш формальна, ніж ви можете очікувати. До начальника звертаються на «du» і на ім'я. Тут фрази, щоб спокійно попросити час, feedback або більше годин.",
    explain: {
      1: "Ідеальний початок будь-якої розмови з начальником. Коротко і ввічливо.",
      12: "Данці часто кажуть просто «feedback», англійською. Це нормально і звучить природно.",
      18: "Нейтральна фраза, щоб запитати про більше годин без тиску. «Muligheden for» означає «можливість».",
      21: "Дуже теплий спосіб завершити розмову. Данці це цінують.",
    },
    dialogues: [
      { title: "Більше годин", lines: [
        ["Anna", "Har du et øjeblik? Jeg vil gerne tale med dig om mine timer.", "У тебе є хвилинка? Я хотіла б поговорити з тобою про мої години.", true],
        ["Chef", "Selvfølgelig. Hvad tænker du?", "Звісно. Що ти думаєш?"],
        ["Anna", "Jeg vil gerne spørge om muligheden for flere timer.", "Я хотіла б запитати про можливість отримати більше годин.", true],
        ["Chef", "Det kan vi godt se på. Hvor mange timer tænker du?", "Можемо це розглянути. Скільки годин ти думаєш?"],
        ["Anna", "Cirka 30 timer om ugen.", "Приблизно 30 годин на тиждень.", true],
        ["Chef", "Jeg vender tilbage til dig i næste uge.", "Я дам тобі відповідь наступного тижня."],
        ["Anna", "Tak, fordi du tog dig tid.", "Дякую, що знайшов час.", true],
      ]},
    ],
    notes: [
      "У Данії до керівника звертаються на «du» і на ім'я, і це не неввічливо. Ієрархія пласка: начальник чекає, що ви самі скажете, якщо чогось хочете. Тож не бійтеся просити про розмову: «Har du et øjeblik?» цілком достатньо.",
      "Medarbejdersamtale (MUS) це щорічна розмова з керівником про роботу і розвиток. Підготуйте кілька фраз з цього розділу заздалегідь: про feedback, години і що ви хотіли б робити.",
    ],
    mistakes: [
      ["Kan De give mig feedback?", "Kan du give mig feedback?", "Форму «De» (Ви) на роботі в Данії майже не використовують. До начальника звертаються на «du»."],
      ["Jeg vil have flere timer.", "Jeg vil gerne have flere timer.", "«Jeg vil have» звучить як вимога. З «gerne» це ввічливе прохання."],
    ],
    messages: [
      ["Керівнику, коротка розмова", "Hej, har du tid til en kort snak? Jeg har et spørgsmål om mine arbejdstider.", "Привіт, маєш час коротко поговорити? У мене є запитання щодо мого робочого часу."],
      ["Керівнику, більше годин", "Hej, jeg vil gerne høre, om der er mulighed for flere timer. Kan vi tale om det, når det passer dig?", "Привіт, я хотіла б дізнатися, чи є можливість отримати більше годин. Можемо поговорити про це, коли тобі буде зручно?"],
    ],
    exercises: [
      { q: "Як почати розмову з начальником?", options: ["Har du et øjeblik?", "Hvad laver du?", "Er du færdig?"] },
      { q: "Як звертаються до начальника в Данії?", options: ["На «du» і на ім'я", "На «De» і на прізвище", "Тільки «chef»"] },
      { q: "Як ввічливо попросити більше годин?", options: ["Jeg vil gerne spørge om muligheden for flere timer.", "Jeg vil have flere timer.", "Giv mig flere timer."] },
      { q: "Що сказати в кінці розмови?", options: ["Tak, fordi du tog dig tid.", "Det er ikke mit problem.", "Vi ses aldrig."] },
    ],
    vocab: [["chef","начальник"],["leder","керівник"],["feedback","зворотний зв'язок"],["timer","години"],["mulighed","можливість"],["forslag","пропозиція"],["fokusere","зосереджуватися"],["medarbejdersamtale","щорічна розмова з керівником"],["anderledes","інакше"],["tid","час"]],
  },

  6: {
    intro: "Small talk у Данії короткий і легкий: вихідні, погода, кава, відпустка. Не потрібно довгих розмов. Достатньо кількох фраз, щоб колеги відчули, що ви поруч.",
    explain: {
      1: "На «Hvordan går det?» зазвичай відповідають коротко: «Godt, tak. Hvad med dig?»",
      16: "«Hyggeligt» одне з найданськіших слів: приємно, затишно, тепло. Так кажуть після обіду з колегами, розмови чи вечірки.",
      22: "Так бажають гарної роботи, наприклад коли ви йдете додому, а колега залишається на зміну.",
    },
    dialogues: [
      { title: "Кава на перерві", lines: [
        ["Kollega", "Hej! Skal du også have kaffe?", "Привіт! Ти теж будеш каву?"],
        ["Anna", "Ja tak! Har du haft en god weekend?", "Так, дякую! У тебе були хороші вихідні?", true],
        ["Kollega", "Ja, vi var ude at gå en tur i skoven. Hvad med dig?", "Так, ми гуляли в лісі. А в тебе?"],
        ["Anna", "Jeg slappede bare af derhjemme. Det var hyggeligt.", "Я просто відпочивала вдома. Було затишно.", true],
        ["Kollega", "Det lyder godt.", "Звучить добре."],
      ]},
    ],
    notes: [
      "Данці рідко питають дуже особисте на роботі. Вихідні, відпустка, погода і діти це безпечні теми. А фраза «Det lyder godt» підходить як відповідь майже на все.",
      "Fredagsbar, спільний обід, торт у п'ятницю: у багатьох данських компаніях є такі маленькі традиції. Приходьте, навіть якщо говорите ще не ідеально. Це найкраща практика мови.",
    ],
    mistakes: [
      ["Hvordan har du?", "Hvordan har du det?", "У цьому запитанні обов'язкове «det»: Hvordan har du det? Відповідь: Jeg har det godt."],
      ["Det var hyggelig.", "Det var hyggeligt.", "Після «det var» прикметник отримує закінчення -t: det var hyggeligt, det var sjovt, det var godt."],
      ["Vil du komme med mig?", "Vil du med?", "Данці кажуть коротко: «Vil du med?» (Підеш зі мною?). Дієслово «komme» тут не потрібне."],
    ],
    messages: [
      ["Колегам, день народження", "Hej alle! Jeg har fødselsdag i dag, så der er kage i personalerummet kl. 12.", "Привіт усім! У мене сьогодні день народження, тож о 12 у кімнаті для персоналу буде торт."],
      ["Колезі, в кінці тижня", "Tak for i dag, det var hyggeligt at arbejde sammen med dig. God weekend!", "Дякую за сьогодні, було приємно працювати разом із тобою. Гарних вихідних!"],
    ],
    exercises: [
      { q: "Як відповісти на «Hvordan går det?»", options: ["Godt, tak. Hvad med dig?", "Jeg går hjem.", "Det går til kl. 16."] },
      { q: "Що означає «Det var hyggeligt»?", options: ["Було приємно", "Було нудно", "Було складно"] },
      { q: "Як запропонувати колезі каву?", options: ["Skal du også have kaffe?", "Har du kaffe?", "Kaffe nu?"] },
      { q: "Як побажати гарних вихідних?", options: ["God weekend!", "God bedring!", "God arbejdslyst!"] },
    ],
    vocab: [["kollega","колега"],["kaffe","кава"],["frokost","обід"],["weekend","вихідні"],["ferie","відпустка"],["hyggeligt","приємно, затишно"],["spændende","цікаво"],["planer","плани"],["fødselsdag","день народження"],["kage","торт, тістечко"]],
  },

  7: {
    intro: "Помилки трапляються з усіма. У Данії цінують, коли людина чесно каже «Det var min fejl» і пропонує рішення. Тут фрази, щоб спокійно пояснити проблему і не посилити конфлікт.",
    explain: {
      4: "Визнати помилку в Данії це ознака професійності, а не слабкості. Після цієї фрази додайте, що ви зробите: «Jeg skal nok rette det.»",
      18: "Дуже м'який спосіб сказати, що виникло непорозуміння. Ніхто не винен, просто зрозуміли по-різному.",
      22: "Ввічливий спосіб не погодитися. Звучить спокійно і без агресії.",
      24: "Так данці заспокоюють, коли хтось помилився. Якщо вам так кажуть, усе гаразд.",
    },
    dialogues: [
      { title: "Помилка із замовленням", lines: [
        ["Anna", "Undskyld, jeg tror, der er sket en fejl med bestillingen.", "Вибач, думаю, із замовленням сталася помилка.", true],
        ["Chef", "Okay, hvad er der sket?", "Добре, що сталося?"],
        ["Anna", "Jeg har bestilt de forkerte varer. Det var min fejl.", "Я замовила не ті товари. Це була моя помилка.", true],
        ["Chef", "Det sker. Kan du ringe til leverandøren?", "Таке трапляється. Можеш зателефонувати постачальнику?"],
        ["Anna", "Ja, jeg ringer med det samme. Jeg sørger for, at det ikke sker igen.", "Так, я зателефоную одразу. Я подбаю, щоб це не повторилося.", true],
      ]},
    ],
    notes: [
      "У Данії конфлікти вирішують тихо і прямо, без крику. Краще сказати «Kan vi tale om det?» віч-на-віч, ніж мовчати або скаржитися іншим. Ви маєте право не погоджуватися, головне спокійно.",
    ],
    mistakes: [
      ["Jeg har gjort en fejl.", "Jeg har lavet en fejl.", "Про помилку данці зазвичай кажуть «lave en fejl». «Gøre en fejl» можна почути, але «lave» природніше."],
      ["Det er ikke min skyld!", "Jeg tror, vi har misforstået hinanden.", "Перша фраза граматично правильна, але звучить захисно і різко. Друга допомагає розв'язати ситуацію без конфлікту."],
      ["Undskyld mig for fejlen.", "Undskyld fejlen.", "Коротко і природно: «Undskyld fejlen» або «Jeg beklager fejlen». «Undskyld mig» кажуть, коли хочуть пройти чи звернути на себе увагу."],
    ],
    messages: [
      ["Керівнику, помилка", "Hej, jeg har desværre lavet en fejl i dag. Jeg har allerede rettet den, men jeg ville gerne sige det til dig.", "Привіт, на жаль, я сьогодні зробила помилку. Я вже її виправила, але хотіла тобі про це сказати."],
      ["Колезі, не працює система", "Hej, systemet virker ikke hos mig. Jeg har prøvet flere gange. Kan du hjælpe?", "Привіт, у мене не працює система. Я пробувала кілька разів. Можеш допомогти?"],
    ],
    exercises: [
      { q: "Як визнати помилку?", options: ["Det var min fejl.", "Det er ikke mit problem.", "Det virker ikke."] },
      { q: "Колега каже «Det sker». Що це означає?", options: ["Таке трапляється", "Це станеться", "Це погано"] },
      { q: "Як ввічливо не погодитися?", options: ["Jeg ser det anderledes.", "Du tager fejl!", "Nej, nej, nej."] },
      { q: "Як сказати «Це не працює»?", options: ["Det virker ikke.", "Det arbejder ikke.", "Det går ikke hjem."], why: "Про речі і системи кажуть «virke», а не «arbejde»." },
    ],
    vocab: [["fejl","помилка"],["problem","проблема"],["løsning","рішення"],["rette","виправити"],["misforståelse","непорозуміння"],["virke","працювати (про річ)"],["beklage","перепрошувати"],["konflikt","конфлікт"],["uenig","не згодна"],["skyld","провина"]],
  },

  8: {
    intro: "Телефонувати данською часто найстрашніше, бо не видно обличчя. Не соромтеся просити говорити повільніше або надіслати інформацію SMS. Тут фрази для дзвінків, повідомлень і коротких листів.",
    explain: {
      6: "Корисно для імен, адрес і назв, які важко розчути по телефону.",
      13: "Якщо телефонують у незручний момент, це нормальна фраза. Додайте «Må jeg ringe tilbage om lidt?»",
      22: "Типова фраза для e-mail. «Vedhæftet» означає «у вкладенні».",
      25: "Стандартне завершення листа. Часто пишуть скорочено: «Vh» або «Mvh» (Med venlig hilsen).",
    },
    dialogues: [
      { title: "Дзвінок щодо зміни", lines: [
        ["Anna", "Hej, det er Anna. Jeg ringer angående min vagt i morgen.", "Привіт, це Анна. Я телефоную щодо моєї зміни завтра.", true],
        ["Kontoret", "Hej Anna. Du starter klokken syv.", "Привіт, Анно. Ти починаєш о сьомій."],
        ["Anna", "Undskyld, jeg hørte ikke det sidste. Kan du gentage det?", "Вибач, я не почула останнє. Можеш повторити?", true],
        ["Kontoret", "Klokken syv. Jeg sender det også på sms.", "О сьомій. Я також надішлю це SMS."],
        ["Anna", "Tusind tak. Hav en god dag.", "Щиро дякую. Гарного дня.", true],
      ]},
    ],
    notes: [
      "Якщо боїтеся телефонувати, заздалегідь запишіть 2-3 фрази на папері. А фраза «Kan du sende det på sms?» рятує завжди: ви отримаєте інформацію письмово і зможете спокійно перечитати.",
      "У данських листах не потрібні довгі формальності. «Hej» та ім'я на початку і «Venlig hilsen» в кінці підходять майже для всіх ситуацій, навіть для листа начальнику чи HR.",
    ],
    mistakes: [
      ["Kære chef, jeg skriver til Dem…", "Hej Mette, jeg skriver for at…", "Данські робочі листи прості. Звертаються на ім'я і на «du». Форма «Dem» звучить дуже старомодно."],
      ["Jeg ringer tilbage om lidt tid.", "Jeg ringer tilbage om lidt.", "«Om lidt» вже означає «трохи згодом». Слово «tid» тут зайве."],
    ],
    messages: [
      ["Керівнику, e-mail", "Hej Mette\n\nJeg skriver lige for at spørge, om jeg kan få fri på fredag. Giv mig endelig besked.\n\nVenlig hilsen\nAnna", "Привіт, Метте\n\nПишу, щоб запитати, чи можу я взяти вихідний у п'ятницю. Обов'язково дай мені знати.\n\nЗ повагою\nАнна"],
      ["Колезі, SMS", "Hej, jeg kan ikke tale lige nu. Jeg ringer tilbage om lidt.", "Привіт, я зараз не можу говорити. Передзвоню трохи згодом."],
    ],
    exercises: [
      { q: "Ви не почули кінець речення по телефону. Що скажете?", options: ["Jeg hørte ikke det sidste.", "Jeg har ikke tid.", "Jeg er på vej."] },
      { q: "Як попросити надіслати інформацію SMS?", options: ["Kan du sende det på sms?", "Kan du ringe til mig?", "Kan du stave det?"] },
      { q: "Що означає «Vh» в кінці листа?", options: ["З повагою", "Дуже важливо", "Чекаю відповіді"] },
      { q: "Як сказати «Я передзвоню трохи згодом»?", options: ["Jeg ringer tilbage om lidt.", "Jeg ringer aldrig.", "Jeg ringede i går."] },
    ],
    vocab: [["ringe","телефонувати"],["besked","повідомлення"],["sms","SMS"],["mail","електронний лист"],["svare","відповідати"],["vedhæftet","у вкладенні"],["stave","диктувати по літерах"],["adresse","адреса"],["angående","щодо"],["venlig hilsen","з повагою"]],
  },

  9: {
    intro: "Про зарплату, відпустку і контракт питати нормально і правильно. Тут фрази, щоб розібратися з lønseddel, спланувати ferie і зрозуміти свої умови.",
    explain: {
      2: "Lønseddel це розрахунковий лист. У Данії його часто отримують через e-Boks. Там видно години, податок і відпускні (feriepenge).",
      7: "Про відпустку данці кажуть «holde ferie». «Tage ferie» теж зрозуміють, але «holde» звучить природніше.",
      13: "«Være ansat til» означає, на скільки годин вас узяли на роботу за договором.",
    },
    dialogues: [
      { title: "Питання про зарплату", lines: [
        ["Anna", "Hej, jeg har et spørgsmål om min lønseddel.", "Привіт, у мене є запитання щодо мого розрахункового листа.", true],
        ["HR", "Selvfølgelig. Hvad drejer det sig om?", "Звісно. Про що йдеться?"],
        ["Anna", "Jeg tror, der mangler nogle timer. Jeg arbejdede ekstra i sidste uge.", "Думаю, бракує кількох годин. Минулого тижня я працювала додатково.", true],
        ["HR", "Det tjekker jeg. Har du registreret timerne i systemet?", "Я це перевірю. Ти зареєструвала години в системі?"],
        ["Anna", "Ja, det har jeg. Tak for hjælpen.", "Так, зареєструвала. Дякую за допомогу.", true],
      ]},
    ],
    notes: [
      "Якщо думаєте, що в зарплаті помилка, скажіть про це спокійно. Це звичайна ситуація, і її швидко виправляють. Фраза «Jeg tror, der er en fejl på min lønseddel» звучить нейтрально і нікого не звинувачує.",
      "Feriepenge це відпускні гроші, які накопичуються з кожної зарплати. Запитайте на роботі, як у вас працює система відпусток: «Hvordan fungerer ferie her?»",
    ],
    mistakes: [
      ["Hvornår får jeg min betaling?", "Hvornår får jeg min løn?", "Про зарплату данці кажуть «løn». «Betaling» це оплата, наприклад рахунку."],
      ["Jeg vil gerne tage ferie næste uge.", "Jeg vil gerne holde ferie i næste uge.", "Природніше «holde ferie», і перед «næste uge» потрібне «i»."],
    ],
    messages: [
      ["HR, відпустка", "Hej, jeg vil gerne holde ferie i uge 29 og 30. Hvordan søger jeg om det?", "Привіт, я хотіла б піти у відпустку на 29-му і 30-му тижнях. Як мені подати заявку?"],
      ["HR, помилка в зарплаті", "Hej, jeg tror, der er en fejl på min lønseddel for marts. Kan du hjælpe mig med at se på det?", "Привіт, думаю, у моєму розрахунковому листі за березень є помилка. Можеш допомогти мені це перевірити?"],
    ],
    exercises: [
      { q: "Що таке «lønseddel»?", options: ["Розрахунковий лист", "Графік змін", "Контракт"] },
      { q: "Як сказати «Я хотіла б піти у відпустку наступного тижня»?", options: ["Jeg vil gerne holde ferie i næste uge.", "Jeg holder altid fri.", "Jeg havde ferie i går."] },
      { q: "Як запитати, чи можна отримати більше годин?", options: ["Er der mulighed for flere timer?", "Hvor mange timer er klokken?", "Har du tid?"] },
      { q: "«Hvornår udløber min kontrakt?» означає:", options: ["Коли закінчується мій контракт?", "Коли підписати контракт?", "Де мій контракт?"] },
    ],
    vocab: [["løn","зарплата"],["lønseddel","розрахунковий лист"],["ferie","відпустка"],["feriedage","дні відпустки"],["feriepenge","відпускні"],["kontrakt","контракт"],["vilkår","умови"],["skat","податок"],["overenskomst","колективний договір"],["ansat","працевлаштована"]],
  },

  10: {
    intro: "Перші тижні на новому місці повні запитань: кому писати, де реєструвати години, де лежать речі. Тут фрази, щоб знайти потрібну людину і потрібну інформацію.",
    explain: {
      1: "«Nærmeste leder» це ваш безпосередній керівник, людина, до якої ви звертаєтеся першою.",
      4: "У багатьох компаніях є довідник працівника з правилами: хвороба, відпустка, перерви. Його варто прочитати.",
      23: "Коротка ділова відповідь: «прийнято, записала». Добре підходить для повідомлень і пошти.",
    },
    dialogues: [
      { title: "Розмова з HR", lines: [
        ["Anna", "Undskyld, hvem skal jeg melde mig syg til?", "Вибачте, кому я маю повідомляти про хворобу?", true],
        ["HR", "Du ringer til din nærmeste leder, inden din vagt starter.", "Ти телефонуєш своєму безпосередньому керівнику до початку зміни."],
        ["Anna", "Okay. Og hvor registrerer jeg min arbejdstid?", "Добре. А де я реєструю свій робочий час?", true],
        ["HR", "I appen. Jeg viser dig det bagefter.", "У застосунку. Я покажу тобі потім."],
        ["Anna", "Tak for hjælpen. Det er noteret.", "Дякую за допомогу. Я записала.", true],
      ]},
    ],
    notes: [
      "Якщо не знаєте, кого запитати, запитайте про це прямо: «Hvem kan jeg spørge, hvis jeg er i tvivl?». У Данії ніхто не чекає, що новенька знає все одразу.",
    ],
    mistakes: [
      ["Hvem er min boss?", "Hvem er min nærmeste leder?", "Англійське «boss» можна почути в розмові, але на роботі кажуть «leder» або «chef»."],
      ["Hvor er toilet?", "Hvor er toilettet?", "Коли питаєте про конкретне місце, слово отримує закінчення: toilettet, køkkenet, personalerummet."],
    ],
    messages: [
      ["HR, нова у відділі", "Hej, jeg er ny i afdelingen. Hvor kan jeg finde medarbejderhåndbogen?", "Привіт, я нова у відділі. Де я можу знайти довідник працівника?"],
      ["Керівнику, підтвердження", "Tak for informationen. Det er noteret.", "Дякую за інформацію. Записала."],
    ],
    exercises: [
      { q: "Хто такий «nærmeste leder»?", options: ["Безпосередній керівник", "Найближчий колега", "Директор компанії"] },
      { q: "Як запитати, де туалет?", options: ["Hvor er toilettet?", "Hvem er toilettet?", "Hvornår er toilettet?"] },
      { q: "Як сказати «Дякую за допомогу»?", options: ["Tak for hjælpen.", "Tak for mad.", "Tak for sidst."] },
      { q: "«Det er noteret» означає:", options: ["Прийнято, я записала", "Це заборонено", "Це нотатка"] },
    ],
    vocab: [["leder","керівник"],["HR","відділ кадрів"],["afdeling","відділ"],["personalerum","кімната для персоналу"],["regler","правила"],["registrere","реєструвати"],["arbejdstid","робочий час"],["ansvar","відповідальність"],["medarbejder","працівник"],["i tvivl","у сумніві"]],
  },

  11: {
    intro: "Перший день на новій роботі завжди хвилює. Фрази з цього розділу допоможуть познайомитися, попросити все показати і не боятися сказати «Jeg lærer stadig».",
    explain: {
      4: "«Glæde sig til» означає з радістю чекати чогось. Дуже позитивна фраза: jeg glæder mig til weekenden, jeg glæder mig til at arbejde med jer.",
      18: "Чесна і сильна фраза. Колеги поставляться з розумінням і охочіше допоможуть.",
      20: "Ця фраза показує, що ви відповідальна. На новому місці це найкраща стратегія.",
    },
    dialogues: [
      { title: "Перший день", lines: [
        ["Kollega", "Hej, du må være den nye?", "Привіт, ти, мабуть, новенька?"],
        ["Anna", "Ja, jeg hedder Anna. Det er min første dag.", "Так, мене звати Анна. Сьогодні мій перший день.", true],
        ["Kollega", "Velkommen! Jeg hedder Sofie. Skal jeg vise dig rundt?", "Ласкаво просимо! Я Софі. Показати тобі все?"],
        ["Anna", "Ja tak, det vil jeg gerne. Hvor lægger vi vores ting?", "Так, дякую, дуже хочу. Де ми залишаємо свої речі?", true],
        ["Kollega", "Derovre i skabene. Og køkkenet er lige her.", "Он там, у шафках. А кухня ось тут."],
        ["Anna", "Tak, det hjælper meget.", "Дякую, це дуже допомагає.", true],
      ]},
    ],
    notes: [
      "Перші тижні на новій роботі нікому не легкі, особливо іншою мовою. Скажіть колегам, що вчите данську: «Jeg lærer dansk, så sig endelig til, hvis jeg ikke forstår.» Більшість зрадіє і говоритиме повільніше.",
    ],
    mistakes: [
      ["Mit navn er Anna.", "Jeg hedder Anna.", "«Mit navn er» граматично правильно, але звучить офіційно. Данці знайомляться просто: «Jeg hedder Anna.»"],
      ["Det er rart at møde du.", "Det er rart at møde dig.", "Після дієслова потрібна форма «dig» (тебе), а не «du» (ти)."],
    ],
    messages: [
      ["Колегам, знайомство", "Hej alle sammen! Jeg hedder Anna og er ny her. Jeg glæder mig til at arbejde sammen med jer.", "Привіт усім! Мене звати Анна, я тут новенька. Я рада працювати разом із вами."],
      ["Керівнику, після першого дня", "Tak for en god første dag. Vi ses i morgen!", "Дякую за хороший перший день. Побачимося завтра!"],
    ],
    exercises: [
      { q: "Як представитися?", options: ["Jeg hedder Anna.", "Jeg er Anna navn.", "Hedder jeg Anna."] },
      { q: "Як попросити, щоб вам усе показали?", options: ["Kan du vise mig rundt?", "Kan du gå rundt?", "Kan du se mig?"] },
      { q: "Як сказати «Я все ще вчуся»?", options: ["Jeg lærer stadig.", "Jeg lærer aldrig.", "Jeg har lært."] },
      { q: "«Jeg glæder mig til at komme i gang» означає:", options: ["Я рада почати", "Я вже закінчила", "Я йду додому"] },
    ],
    vocab: [["ny","нова, новий"],["første dag","перший день"],["vise rundt","показати все"],["køkken","кухня"],["skab","шафка"],["ansvarlig","відповідальний"],["lære","вчитися"],["velkommen","ласкаво просимо"],["rart","приємно"],["hedde","називатися"]],
  },

  12: {
    description: "Короткі живі фрази, які данці кажуть щодня.",
    intro: "Це маленькі фрази, які ви чутимете на роботі щодня. Вони короткі, але саме вони роблять вашу данську живою. Вивчіть їх як готові блоки, не розбираючи граматику.",
    explain: {
      1: "Дуже данська відповідь на складне запитання. Можна додати, від чого залежить: «Det kommer an på vejret».",
      12: "«Være i tvivl» означає сумніватися, вагатися. Дуже часто: «Hvis du er i tvivl, så spørg.»",
      27: "Знову маленьке «lige»: воно пом'якшує прохання почекати.",
    },
    dialogues: [
      { title: "Хвилинку!", lines: [
        ["Kollega", "Kan du hjælpe mig med kasserne?", "Можеш допомогти мені з коробками?"],
        ["Anna", "Lige et øjeblik. Jeg er næsten færdig.", "Хвилинку. Я майже закінчила.", true],
        ["Kollega", "Det er helt fint.", "Все добре."],
        ["Anna", "Så, nu kan jeg godt. Hvad skal jeg gøre?", "Все, тепер можу. Що мені робити?", true],
        ["Kollega", "Bare bær dem ud til bilen.", "Просто віднеси їх до машини."],
        ["Anna", "Det er ikke noget problem.", "Це не проблема.", true],
      ]},
    ],
    notes: [
      "Ці фрази як цеглинки. Не намагайтеся перекладати їх дослівно. Просто запам'ятайте, в якій ситуації їх кажуть, і повторюйте вголос. Через тиждень вони почнуть з'являтися у вашій мові самі.",
    ],
    mistakes: [
      ["Det afhænger.", "Det kommer an på.", "У повсякденній розмові «це залежить» данською майже завжди «det kommer an på». «Det afhænger af…» теж є, але тільки з продовженням."],
      ["Et moment.", "Et øjeblik.", "«Et øjeblik» (дослівно «один погляд») це найприродніший спосіб сказати «хвилинку»."],
    ],
    messages: [
      ["Колезі", "Et øjeblik, jeg kommer om lidt.", "Хвилинку, я скоро прийду."],
    ],
    exercises: [
      { q: "Що означає «Det kommer an på»?", options: ["Це залежить", "Це приходить", "Це не важливо"] },
      { q: "Як сказати «Хвилинку»?", options: ["Et øjeblik.", "Et minut nu.", "En tid."] },
      { q: "Колега просить про допомогу, а ви зайняті. Що скажете?", options: ["Lige et øjeblik.", "Nej tak.", "Vi ses senere."] },
      { q: "Як сказати «Я сумніваюся»?", options: ["Jeg er i tvivl.", "Jeg er tvivl.", "Jeg har tvivlet."] },
    ],
    vocab: [["øjeblik","мить, хвилинка"],["tvivl","сумнів"],["næsten","майже"],["færdig","готово"],["lige","щойно, зараз"],["hjælp","допомога"],["senere","пізніше"],["skridt","крок"],["mene","мати на увазі"],["om lidt","трохи згодом"]],
  },
};
