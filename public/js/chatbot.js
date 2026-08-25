(function () {
  const KB = {
    pt: {
      greeting: "Olá! 👋 Sou o assistente virtual da Gleyci. Posso ajudar com preços, horários, marcações ou localização. Em que posso ajudar?",
      quick: ["Preços", "Horários", "Marcar", "Localização", "Falar com a Gleyci"],
      fallback: "Não tenho a certeza sobre isso — mas podes contactar a Gleyci diretamente pelo Instagram (botão aqui ao lado) que ela responde rapidinho!",
      rules: [
        { test: /\b(preç|valor|quanto custa|tabela)\w*/i, reply: () => renderPrices('pt') },
        { test: /\b(horári|aberto|funciona|abre|fecha)\w*/i, reply: () => "Estamos abertos de terça a sábado, das 9h às 19h. Encerrado ao domingo e segunda." },
        { test: /\b(marca|agend|reserv|book)\w*/i, reply: () => "Podes marcar diretamente aqui no site! Desce até à secção 'Marcações', escolhe o serviço, o dia e o horário disponível. É preciso ter conta — criar é rápido, só nome, email e password." },
        { test: /\b(local|onde fica|morada|endereço|lisboa)\w*/i, reply: () => "Estamos em Lisboa. Para a morada exata, o mais rápido é perguntar diretamente à Gleyci pelo Instagram (botão aqui ao lado)." },
        { test: /\b(loiro|balayage|iluminaç|mecha)\w*/i, reply: () => "A Gleyci é especialista em loiros! Temos Iluminação e Balayage disponíveis — vê os preços na secção 'Serviços' ou pergunta-me 'preços'." },
        { test: /\b(correç|corrigir|cor errada|cor mal)\w*/i, reply: () => "Fazemos correção de cor profissional para reverter tingimentos mal feitos. É um serviço mais demorado — recomendo marcares com antecedência." },
        { test: /\b(cancel|desmarcar)\w*/i, reply: () => "Podes cancelar uma marcação na área 'As minhas marcações' depois de teres sessão iniciada." },
        { test: /\b(insta|instagram)\w*/i, reply: () => "Podes seguir o trabalho da Gleyci em @hairstudiogleycifelix — botão do Instagram aqui ao lado 📸" },
        { test: /\b(whatsapp|telefone|contact|falar com)\w*/i, reply: () => "Podes contactar a Gleyci diretamente pelo Instagram — botão aqui ao lado." },
        { test: /\b(obrigad|thank|valeu)\w*/i, reply: () => "De nada! 😊 Qualquer coisa, estou aqui." },
        { test: /\b(ol[áa]|boa tarde|bom dia|boa noite|hey|hello)\w*/i, reply: () => "Olá! Em que posso ajudar? Preços, horários, marcações ou localização." }
      ]
    },
    en: {
      greeting: "Hi! 👋 I'm Gleyci's virtual assistant. I can help with prices, hours, bookings or location. How can I help?",
      quick: ["Prices", "Hours", "Book", "Location", "Talk to Gleyci"],
      fallback: "I'm not sure about that — but you can message Gleyci directly on Instagram (button here) and she'll get back to you quickly!",
      rules: [
        { test: /\b(price|cost|how much|rates)\w*/i, reply: () => renderPrices('en') },
        { test: /\b(hour|open|close|schedule)\w*/i, reply: () => "We're open Tuesday to Saturday, 9am to 7pm. Closed on Sundays and Mondays." },
        { test: /\b(book|appointment|reserve|schedule)\w*/i, reply: () => "You can book right here on the site! Scroll down to the 'Booking' section, pick the service, day and an available time. You'll need an account — it's quick to create, just name, email and password." },
        { test: /\b(locat|where|address|lisbon)\w*/i, reply: () => "We're based in Lisbon. For the exact address, the fastest way is to ask Gleyci directly via Instagram (button here)." },
        { test: /\b(blonde|balayage|highlight)\w*/i, reply: () => "Gleyci specializes in blonde tones! We offer Highlights and Balayage — check the 'Services' section for prices, or just ask me 'prices'." },
        { test: /\b(correct|fix|bad color|wrong color)\w*/i, reply: () => "We offer professional color correction to fix previous coloring mistakes. It's a longer session — booking ahead is recommended." },
        { test: /\b(cancel)\w*/i, reply: () => "You can cancel a booking under 'My bookings' once you're logged in." },
        { test: /\b(insta|instagram)\w*/i, reply: () => "Follow Gleyci's work at @hairstudiogleycifelix — Instagram button right here 📸" },
        { test: /\b(whatsapp|phone|contact|talk to)\w*/i, reply: () => "You can reach Gleyci directly via Instagram — button right here." },
        { test: /\b(thank|thanks)\w*/i, reply: () => "You're welcome! 😊 Happy to help anytime." },
        { test: /\b(hi|hello|hey|good morning|good afternoon|good evening)\w*/i, reply: () => "Hi there! How can I help? Prices, hours, booking or location." }
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

  let opened = false;
  let history = [];

  function currentLang() { return (window.LANG === 'en') ? 'en' : 'pt'; }

  function addBubble(text, from) {
    const container = document.getElementById('chatMessages');
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ' + from;
    bubble.innerText = text;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }

  function renderQuick() {
    const lang = currentLang();
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
    const lang = currentLang();
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

    input.placeholder = currentLang() === 'pt' ? 'Escreve a tua pergunta…' : 'Type your question…';
    headerSub.innerText = currentLang() === 'pt' ? 'Assistente virtual' : 'Virtual assistant';

    toggle.addEventListener('click', () => {
      opened = !opened;
      panel.classList.toggle('open', opened);
      iconOpen.style.display = opened ? 'none' : 'block';
      iconClose.style.display = opened ? 'block' : 'none';
      if (opened && !history.length) {
        addBubble(KB[currentLang()].greeting, 'bot');
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
