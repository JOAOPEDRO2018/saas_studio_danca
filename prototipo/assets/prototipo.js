// Navegação do protótipo: liga entre si as telas exportadas do Stitch.
// Carregado no fim de cada página, depois dos scripts originais de cada tela.
(function () {
  const pagina = location.pathname.split('/').pop() || 'index.html';

  function aviso(texto) {
    let el = document.getElementById('proto-aviso');
    if (!el) {
      el = document.createElement('div');
      el.id = 'proto-aviso';
      el.setAttribute('role', 'status');
      el.className = 'fixed left-1/2 -translate-x-1/2 bottom-8 z-[100] px-5 py-3 rounded-xl bg-inverse-surface text-inverse-on-surface font-label-lg text-label-lg shadow-lg transition-opacity duration-300 pointer-events-none';
      document.body.appendChild(el);
    }
    el.textContent = texto;
    el.style.opacity = '1';
    clearTimeout(el._timer);
    el._timer = setTimeout(() => { el.style.opacity = '0'; }, 2800);
  }

  function botoesComTexto(regex) {
    return Array.from(document.querySelectorAll('button')).filter(b => regex.test(b.textContent.trim()));
  }

  // Itens do menu que ainda não têm tela desenhada.
  document.querySelectorAll('[data-em-breve]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    aviso('Esta tela ainda não faz parte do protótipo.');
  }));

  // Login: o botão "Entrar" leva para dentro do sistema.
  if (document.getElementById('login-form')) {
    window.handleLoginSubmit = function () {
      const btn = document.getElementById('submit-btn');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="inline-block animate-spin material-symbols-outlined text-[20px]">progress_activity</span><span>Entrando...</span>';
      }
      setTimeout(() => { location.href = 'alunos.html'; }, 700);
    };
    botoesComTexto(/Escanear|Esqueceu/).forEach(b => b.addEventListener('click', e => {
      e.preventDefault();
      aviso('Este fluxo ainda não faz parte do protótipo.');
    }));
  }

  // Menu do usuário no topo, com a opção de sair.
  const avatar = document.getElementById('proto-avatar');
  if (avatar) {
    const chip = avatar.parentElement;
    chip.classList.add('relative', 'cursor-pointer');
    const menu = document.createElement('div');
    menu.className = 'hidden absolute right-0 top-full mt-2 w-44 rounded-xl bg-surface-container-lowest shadow-lg border border-surface-container-high py-1 z-50';
    menu.innerHTML = '<a href="index.html" class="flex items-center gap-2 px-4 py-2 font-label-lg text-label-lg text-on-surface hover:bg-surface-container-high"><span class="material-symbols-outlined text-[18px]">logout</span>Sair</a>';
    chip.appendChild(menu);
    chip.addEventListener('click', e => { if (!menu.contains(e.target)) menu.classList.toggle('hidden'); });
    document.addEventListener('click', e => { if (!chip.contains(e.target)) menu.classList.add('hidden'); });
  }

  // Equipe: "Novo Colaborador" abre a tela completa de cadastro em vez do modal simples.
  const novoColaborador = document.getElementById('btnOpenProfessorModal');
  if (novoColaborador) {
    novoColaborador.onclick = () => { location.href = 'cadastrar-colaborador.html'; };
  }

  // Cadastro de colaborador: cancelar e salvar voltam para a Equipe.
  if (pagina === 'cadastrar-colaborador.html') {
    botoesComTexto(/Cancelar$|Descartar Rascunho/).forEach(b => b.addEventListener('click', () => {
      location.href = 'equipe.html';
    }));
    ['btnSalvarColaborador', 'btnSalvarColaboradorBottom'].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.addEventListener('click', () => {
        aviso('Colaborador cadastrado (simulação).');
        setTimeout(() => { location.href = 'equipe.html'; }, 1800);
      });
    });
  }

  const selo = document.createElement('div');
  selo.className = 'fixed bottom-3 right-3 z-[90] px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm shadow-sm border border-surface-container-high pointer-events-none';
  selo.textContent = 'Protótipo navegável · dados fictícios';
  document.body.appendChild(selo);
})();
