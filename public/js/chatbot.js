(function () {
  const KB = {
    pt: {
      greeting: "Olá! 👋 Sou o assistente virtual da Gleyci. Posso ajudar com preços, horários, marcações, localização e muito mais. Em que posso ajudar?",
      quick: ["Preços", "Horários", "Marcar", "Localização"],
      fallback: "Não tenho a certeza sobre isso — mas podes contactar a Gleyci diretamente pelo Instagram (botão aqui ao lado) que ela responde rapidinho! Também podes tentar reformular a pergunta.",
      rules: [
        { test: /\b(preç|valor|quanto custa|tabela|orçamento)\w*/i, reply: () => renderPrices('pt') },
        { test: /\b(horári|aberto|funciona|abre|fecha|que horas)\w*/i, reply: () => renderHours('pt') },
        { test: /\b(cancel|desmarcar|remarcar|adiar)\w*/i, reply: () => "Podes cancelar ou consultar uma marcação em 'As minhas marcações' (clica no teu nome, no menu). Se quiseres remarcar, cancela a atual e faz uma nova no horário que preferires." },
        { test: /\b(marca|agend|reserv|book)\w*/i, reply: () => "Podes marcar diretamente aqui no site! Desce até à secção 'Marcações', escolhe o serviço, o dia e o horário disponível. É preciso ter conta — criar é rápido, só nome, email e password. A marcação fica pendente até a Gleyci confirmar." },
        { test: /\b(confirma[çc][ãa]o|pendente|aceit|quando sei se)\w*/i, reply: () => "Assim que marcas, o pedido fica 'Pendente' até a Gleyci aceitar. Depois de aceite, aparece como 'Confirmada' em 'As minhas marcações'." },
        { test: /\b(local|onde fica|morada|endereço|lisboa|rua)\w*/i, reply: () => "Estamos na R. das Pedralvas 15, Lj 12, 1500-487 Lisboa. Vê o mapa na secção 'Localização' do site, com um botão para abrir diretamente no Google Maps." },
        { test: /\b(loiro|balayage|iluminaç|mecha)\w*/i, reply: () => "A Gleyci é especialista em loiros! Temos Iluminação e Balayage disponíveis — vê os preços na secção 'Serviços' ou pergunta-me 'preços'." },
        { test: /\b(diferença.*(balayage|mecha|iluminaç))\w*/i, reply: () => "Iluminação usa folhas de alumínio para tons mais uniformes; Balayage é pintado à mão, criando um efeito mais natural e degradê. A Gleyci ajuda-te a escolher na consulta." },
        { test: /\b(correç|corrigir|cor errada|cor mal|reverter)\w*/i, reply: () => "Fazemos correção de cor profissional para reverter tingimentos mal feitos. É um serviço mais demorado — recomendo marcares com antecedência e explicares o histórico do teu cabelo." },
        { test: /\b(insta|instagram)\w*/i, reply: () => "Podes seguir o trabalho da Gleyci em @hairstudiogleycifelix — botão do Instagram aqui ao lado 📸" },
        { test: /\b(whatsapp|telefone|contact|falar com|numero)\w*/i, reply: () => "Podes contactar a Gleyci diretamente pelo Instagram — botão aqui ao lado." },
        { test: /\b(pagament|pagar|dinheiro|multibanco|mbway|cartão|cartao)\w*/i, reply: () => "Podes pagar diretamente no estúdio — o método exato (dinheiro, cartão ou MB Way) confirma-se com a Gleyci no dia." },
        { test: /\b(sinal|dep[oó]sito|adiantament)\w*/i, reply: () => "Por agora não é pedido sinal para marcar — só confirma a tua presença. Se precisares de cancelar, avisa com antecedência." },
        { test: /\b(atras|chegar tarde)\w*/i, reply: () => "Se souberes que vais chegar atrasada(o), o melhor é avisar a Gleyci pelo Instagram para ela poder ajustar a agenda." },
        { test: /\b(primeira vez|primeira consulta|nunca fui)\w*/i, reply: () => "Que bom ter-te por cá! Na primeira visita a Gleyci costuma fazer uma pequena consulta para perceber o teu cabelo e o resultado que procuras, antes de começar o serviço." },
        { test: /\b(alerg|sensibilidade|teste de alergia|patch test)\w*/i, reply: () => "Se tens histórico de alergias a produtos de coloração, avisa a Gleyci antes da marcação — ela pode recomendar um teste de sensibilidade prévio." },
        { test: /\b(produt|marca.*usa|olaplex)\w*/i, reply: () => "A Gleyci trabalha com produtos profissionais de coloração e tratamento capilar de alta qualidade, incluindo proteção da fibra do cabelo durante o processo." },
        { test: /\b(grávid|gravidez|amamenta)\w*/i, reply: () => "Recomendamos falares diretamente com a Gleyci sobre coloração durante a gravidez ou amamentação, para ela avisar sobre os cuidados adequados." },
        { test: /\b(homem|masculin|corte de homem)\w*/i, reply: () => "O foco da Gleyci é em coloração e cortes femininos, especialmente loiros. Para confirmar se atende cortes masculinos, pergunta diretamente pelo Instagram." },
        { test: /\b(criança|infantil|menor)\w*/i, reply: () => "Para marcações com menores, o melhor é confirmar diretamente com a Gleyci pelo Instagram." },
        { test: /\b(quanto tempo|duração|demora)\w*/i, reply: () => "A duração depende do serviço — desde 45 minutos para um corte simples até mais de 3 horas para coloração ou correção de cor. Vês a duração de cada serviço na secção 'Serviços'." },
        { test: /\b(estacionamento|parque|carro)\w*/i, reply: () => "Não tenho essa informação em detalhe — pergunta à Gleyci pelo Instagram sobre opções de estacionamento perto do estúdio." },
        { test: /\b(fatura|recibo|iva)\w*/i, reply: () => "Para questões de faturação, o melhor é falares diretamente com a Gleyci." },
        { test: /\b(equipa|funcionári|quem trabalha|colegas)\w*/i, reply: () => "O estúdio é liderado pela Gleyci Felix, especialista em loiros e coloração com técnica Toni&Guy." },
        { test: /\b(feriad|encerrad[oa]s?|f[ée]rias)\w*/i, reply: () => "Os horários normais estão na secção 'Horários' do site. Em feriados ou férias pode haver alterações — o melhor é confirmar antes de vires." },
        { test: /\b(queixa|reclama|problema com)\w*/i, reply: () => "Lamento se algo correu mal! O melhor é falares diretamente com a Gleyci pelo Instagram para ela poder ajudar-te." },
        { test: /\b(obrigad|thank|valeu|fixe|ótimo|otimo)\w*/i, reply: () => "De nada! 😊 Qualquer coisa, estou aqui." },
        { test: /\b(ol[áa]|boa tarde|bom dia|boa noite|hey|hello)\w*/i, reply: () => "Olá! Em que posso ajudar? Preços, horários, marcações, localização ou outra coisa qualquer." },
        { test: /\b(quem és|quem es tu|é um robot|es um bot|humano)\w*/i, reply: () => "Sou um assistente virtual do site da Gleyci Felix — ajudo com perguntas rápidas! Para algo mais específico, fala com ela pelo Instagram." }
      ]
    },
    en: {
      greeting: "Hi! 👋 I'm Gleyci's virtual assistant. I can help with prices, hours, bookings, location and more. How can I help?",
      quick: ["Prices", "Hours", "Book", "Location"],
      fallback: "I'm not sure about that — but you can message Gleyci directly on Instagram (button here) and she'll get back to you quickly! You could also try rephrasing your question.",
      rules: [
        { test: /\b(price|cost|how much|rates|budget)\w*/i, reply: () => renderPrices('en') },
        { test: /\b(hour|open|close|schedule|what time)\w*/i, reply: () => renderHours('en') },
        { test: /\b(cancel|reschedul|move.*appointment)\w*/i, reply: () => "You can cancel or check a booking under 'My bookings' (click your name in the menu). To reschedule, cancel the current one and book a new time that suits you." },
        { test: /\b(book|appointment|reserve|schedule)\w*/i, reply: () => "You can book right here on the site! Scroll down to the 'Booking' section, pick the service, day and an available time. You'll need an account — quick to create, just name, email and password. Your request stays pending until Gleyci confirms it." },
        { test: /\b(confirm|pending|accept|when.*know)\w*/i, reply: () => "Once you book, your request is 'Pending' until Gleyci accepts it. After that, it shows as 'Confirmed' under 'My bookings'." },
        { test: /\b(locat|where|address|lisbon|street)\w*/i, reply: () => "We're at R. das Pedralvas 15, Lj 12, 1500-487 Lisboa. Check the 'Location' section for the map, with a button to open directly in Google Maps." },
        { test: /\b(blonde|balayage|highlight)\w*/i, reply: () => "Gleyci specializes in blonde tones! We offer Highlights and Balayage — check the 'Services' section for prices, or just ask me 'prices'." },
        { test: /\b(difference.*(balayage|highlight))\w*/i, reply: () => "Highlights use foils for a more uniform result; balayage is hand-painted for a softer, more natural gradient. Gleyci will help you choose during the consultation." },
        { test: /\b(correct|fix|bad color|wrong color|reverse)\w*/i, reply: () => "We offer professional color correction to fix previous coloring mistakes. It's a longer session — booking ahead is recommended, and it helps to share your hair's coloring history." },
        { test: /\b(insta|instagram)\w*/i, reply: () => "Follow Gleyci's work at @hairstudiogleycifelix — Instagram button right here 📸" },
        { test: /\b(whatsapp|phone|contact|talk to|number)\w*/i, reply: () => "You can reach Gleyci directly via Instagram — button right here." },
        { test: /\b(pay|payment|cash|card)\w*/i, reply: () => "You can pay directly at the studio — the exact method (cash, card, or MB Way) is confirmed with Gleyci on the day." },
        { test: /\b(deposit|advance payment)\w*/i, reply: () => "No deposit is currently required to book — just show up for your appointment. If you need to cancel, please give advance notice." },
        { test: /\b(late|running late)\w*/i, reply: () => "If you know you'll be running late, the best thing is to message Gleyci on Instagram so she can adjust the schedule." },
        { test: /\b(first time|new client|never been)\w*/i, reply: () => "Great to have you! On a first visit, Gleyci usually does a short consultation to understand your hair and the result you're looking for before starting." },
        { test: /\b(allerg|sensitivity|patch test)\w*/i, reply: () => "If you have a history of allergies to coloring products, let Gleyci know before your appointment — she may recommend a sensitivity test beforehand." },
        { test: /\b(product|brand.*use|olaplex)\w*/i, reply: () => "Gleyci works with high-quality professional coloring and treatment products, including hair fiber protection during the process." },
        { test: /\b(pregnan|nursing|breastfeed)\w*/i, reply: () => "We recommend talking directly to Gleyci about coloring during pregnancy or breastfeeding so she can advise on the right precautions." },
        { test: /\b(men|male haircut)\w*/i, reply: () => "Gleyci's focus is on color and women's cuts, especially blonde tones. To confirm if she takes men's cuts, ask directly via Instagram." },
        { test: /\b(child|kid|minor)\w*/i, reply: () => "For bookings involving minors, it's best to confirm directly with Gleyci via Instagram." },
        { test: /\b(how long|duration|take)\w*/i, reply: () => "Duration depends on the service — from 45 minutes for a simple cut up to 3+ hours for coloring or color correction. Check each service's duration in the 'Services' section." },
        { test: /\b(parking|park the car)\w*/i, reply: () => "I don't have detailed info on that — ask Gleyci via Instagram about parking options near the studio." },
        { test: /\b(invoice|receipt|vat)\w*/i, reply: () => "For billing questions, it's best to speak directly with Gleyci." },
        { test: /\b(team|staff|who works|colleagues)\w*/i, reply: () => "The studio is led by Gleyci Felix, a blonde and color specialist trained in the Toni&Guy technique." },
        { test: /\b(holiday|closed|vacation)\w*/i, reply: () => "Regular hours are in the 'Hours' section of the site. On holidays or vacation there may be changes — best to confirm before coming." },
        { test: /\b(complaint|issue with|problem with)\w*/i, reply: () => "Sorry to hear something went wrong! The best step is to message Gleyci directly on Instagram so she can help." },
        { test: /\b(thank|thanks|nice|great|awesome)\w*/i, reply: () => "You're welcome! 😊 Happy to help anytime." },
        { test: /\b(hi|hello|hey|good morning|good afternoon|good evening)\w*/i, reply: () => "Hi there! How can I help? Prices, hours, booking, location, or anything else." },
        { test: /\b(who are you|are you a bot|are you human)\w*/i, reply: () => "I'm a virtual assistant for Gleyci Felix's site — happy to help with quick questions! For anything more specific, message her on Instagram." }
      ]
    }
  };

  function renderPrices(lang) {
    if (!window.SERVICES_DATA || !window.SERVICES_DATA.length) {
      return lang === 'pt' ? "Vê os preços completos na secção 'Serviços'." : "Check full pricing in the 'Services' section.";
    }
    const lines = window.SERVICES_DATA.slice(0, 6).map(s => {
      const name = lang === 'pt' ? s.name_pt : s.name_en;
      return `• ${name} — €${parseFloat(s.price).toFixed(0)}`;
    });
    const intro = lang === 'pt' ? 'Aqui tens alguns preços:' : "Here are some prices:";
    return intro + '\n' + lines.join('\n');
  }

  function renderHours(lang) {
    if (!window.HOURS_DATA || !window.HOURS_DATA.length) {
      return lang === 'pt' ? "Vê o horário completo na secção 'Horários'." : "Check full hours in the 'Hours' section.";
    }
    const namesPt = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const namesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const lines = window.HOURS_DATA.map(h => {
      const name = lang === 'pt' ? namesPt[h.weekday] : namesEn[h.weekday];
      const time = h.active ? `${h.start_time} – ${h.end_time}` : (lang === 'pt' ? 'Encerrado' : 'Closed');
      return `${name}: ${time}`;
    });
    const intro = lang === 'pt' ? 'O nosso horário:' : "Our hours:";
    return intro + '\n' + lines.join('\n');
  }

  // ---- Deteção automática do idioma da mensagem ----
  const PT_HINTS = /\b(o|a|os|as|de|do|da|para|com|não|nao|ol[áa]|qual|quando|quanto|quanto custa|pre[çc]o|marca|marcar|hor[áa]rio|obrigad|sim|onde|localiza[çc][ãa]o|voc[êe]|tu|vocês)\b/i;
  const EN_HINTS = /\b(the|is|are|what|when|how much|price|hour|book|hello|hi|thanks|thank you|where|please|can i|do you)\b/i;

  function detectLang(text) {
    if (!text) return currentSiteLang();
    const ptScore = (text.match(PT_HINTS) || []).length + (/[áàâãéêíóôõúç]/i.test(text) ? 1 : 0);
    const enScore = (text.match(EN_HINTS) || []).length;
    if (ptScore === 0 && enScore === 0) return currentSiteLang();
    return ptScore >= enScore ? 'pt' : 'en';
  }

  function currentSiteLang() { return (window.LANG === 'en') ? 'en' : 'pt'; }

  let opened = false;
  let history = [];

  function addBubble(text, from) {
    const container = document.getElementById('chatMessages');
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ' + from;
    bubble.innerText = text;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }

  function renderQuick() {
    const lang = currentSiteLang();
    const quickEl = document.getElementById('chatQuick');
    quickEl.innerHTML = '';
    KB[lang].quick.forEach(label => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerText = label;
      btn.onclick = () => handleUserMessage(label);
      quickEl.appendChild(btn);
    });
  }

  function handleUserMessage(text) {
    if (!text || !text.trim()) return;
    addBubble(text, 'user');
    const lang = detectLang(text);
    const kb = KB[lang];
    let matched = null;
    for (const rule of kb.rules) {
      if (rule.test.test(text)) { matched = rule; break; }
    }
    setTimeout(() => {
      const reply = matched ? matched.reply() : kb.fallback;
      addBubble(reply, 'bot');
    }, 350);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('chatToggle');
    const panel = document.getElementById('chatPanel');
    const iconOpen = document.getElementById('chatIconOpen');
    const iconClose = document.getElementById('chatIconClose');
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    const headerSub = document.getElementById('chatHeaderSub');

    if (!toggle || !panel) return;

    input.placeholder = currentSiteLang() === 'pt' ? 'Escreve a tua pergunta…' : 'Type your question…';
    headerSub.innerText = currentSiteLang() === 'pt' ? 'Assistente virtual' : 'Virtual assistant';

    toggle.addEventListener('click', () => {
      opened = !opened;
      panel.classList.toggle('open', opened);
      iconOpen.style.display = opened ? 'none' : 'block';
      iconClose.style.display = opened ? 'block' : 'none';
      if (opened && !history.length) {
        addBubble(KB[currentSiteLang()].greeting, 'bot');
        renderQuick();
        history.push(true);
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value;
      input.value = '';
      handleUserMessage(val);
    });
  });
})();
