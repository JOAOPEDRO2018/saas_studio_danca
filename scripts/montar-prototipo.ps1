# Gera o protótipo navegável (prototipo/) a partir das telas exportadas do Stitch (stitch/screens/).
# As telas originais não são alteradas. Rode de novo sempre que exportar telas novas do Stitch:
#   powershell -ExecutionPolicy Bypass -File scripts\montar-prototipo.ps1
$ErrorActionPreference = 'Stop'
$raiz = Split-Path $PSScriptRoot -Parent
$origem = Join-Path $raiz 'stitch\screens'
$destino = Join-Path $raiz 'prototipo'
$utf8 = New-Object System.Text.UTF8Encoding $false

$paginas = @(
  @{ tela = '01-login';                             arquivo = 'index.html';                 titulo = 'Entrar';                        ativo = $null }
  @{ tela = '02-alunos-matriculas';                 arquivo = 'alunos.html';                titulo = 'Alunos &amp; Matrículas';       ativo = 'alunos-matriculas' }
  @{ tela = '03-agenda-horarios';                   arquivo = 'agenda.html';                titulo = 'Agenda de Aulas';               ativo = 'grade-agenda-de-aulas' }
  @{ tela = '04-financeiro-mensalidades';           arquivo = 'financeiro.html';            titulo = 'Financeiro &amp; Mensalidades'; ativo = 'financeiro-mensalidades' }
  @{ tela = '05-equipe-modalidades';                arquivo = 'equipe.html';                titulo = 'Equipe &amp; Modalidades';      ativo = 'professores-modalidades' }
  @{ tela = '06-cadastrar-funcionario-modalidades'; arquivo = 'cadastrar-colaborador.html'; titulo = 'Cadastrar Colaborador';         ativo = 'professores-modalidades' }
  @{ tela = '07-administracao-logs-auditoria';      arquivo = 'administracao.html';         titulo = 'Administração &amp; Logs';      ativo = 'configuracoes-logs' }
)

# Menu único para todas as telas internas (cada tela do Stitch veio com uma variação diferente).
# Itens sem href ainda não têm tela e mostram um aviso no protótipo.
$menu = @(
  @{ path = 'visao-geral';             rotulo = 'Visão Geral';                   icone = 'grid_view';      href = $null }
  @{ path = 'alunos-matriculas';       rotulo = 'Alunos &amp; Matrículas';       icone = 'group';          href = 'alunos.html';        selo = '<span class="font-label-sm text-label-sm px-1.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">248</span>' }
  @{ path = 'grade-agenda-de-aulas';   rotulo = 'Grade &amp; Agenda de Aulas';   icone = 'calendar_month'; href = 'agenda.html' }
  @{ path = 'professores-modalidades'; rotulo = 'Professores &amp; Modalidades'; icone = 'badge';          href = 'equipe.html' }
  @{ path = 'financeiro-mensalidades'; rotulo = 'Financeiro &amp; Mensalidades'; icone = 'payments';       href = 'financeiro.html';    selo = '<span class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">12 Pendentes</span>' }
  @{ path = 'relatorios';              rotulo = 'Relatórios';                    icone = 'query_stats';    href = $null }
  @{ path = 'configuracoes-logs';      rotulo = 'Configurações &amp; Logs';      icone = 'tune';           href = 'administracao.html' }
)
$classeInativo = 'flex items-center justify-between px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all group'
$classeAtivo = 'flex items-center justify-between px-space-md py-space-sm transition-all group bg-primary-container text-on-primary-container font-semibold rounded-xl'

function Montar-Menu($ativo) {
  $itens = foreach ($m in $menu) {
    $classe = $classeInativo; $extra = ''
    if ($m.path -eq $ativo) { $classe = $classeAtivo; $extra = ' aria-current="page"' }
    if ($m.href) { $href = $m.href } else { $href = '#'; $extra += ' data-em-breve' }
    "<a class=`"$classe`" data-path=`"$($m.path)`" href=`"$href`"$extra><div class=`"flex items-center gap-space-sm`"><span class=`"material-symbols-outlined text-[20px] transition-transform group-hover:scale-105`">$($m.icone)</span><span class=`"font-label-lg text-label-lg`">$($m.rotulo)</span></div>$($m.selo)</a>"
  }
  -join $itens
}

New-Item -ItemType Directory -Force $destino | Out-Null

foreach ($p in $paginas) {
  $html = [IO.File]::ReadAllText((Join-Path $origem "$($p.tela)\code.html"), [Text.Encoding]::UTF8)

  # Título da aba.
  $titulo = "<title>IsaDance · $($p.titulo)</title>"
  if ($html -match '<title>[\s\S]*?</title>') { $html = [regex]::Replace($html, '<title>[\s\S]*?</title>', $titulo) }
  else { $html = $html.Replace('<meta charset="utf-8">', '<meta charset="utf-8">' + $titulo) }

  if ($p.ativo) {
    # Troca o menu lateral pelo menu único.
    $nav = [regex]::Matches($html, '(<nav[^>]*data-active-classes[^>]*>)[\s\S]*?(</nav>)')
    if ($nav.Count -ne 1) { throw "$($p.tela): esperava 1 menu lateral, encontrei $($nav.Count)" }
    $html = $html.Remove($nav[0].Index, $nav[0].Length).Insert($nav[0].Index, $nav[0].Groups[1].Value + (Montar-Menu $p.ativo) + $nav[0].Groups[2].Value)

    # A foto de perfil do Stitch é privada da conta Google; troca por um avatar com iniciais.
    $html = [regex]::Replace($html, '<img alt="Profile" class="([^"]*)" src="https://lh3\.googleusercontent\.com/aida/[^"]*"\s*/?>',
      '<div id="proto-avatar" class="$1 bg-secondary-fixed text-primary flex items-center justify-center font-bold text-[11px]">IS</div>')
    if ($html -notmatch 'id="proto-avatar"') { throw "$($p.tela): avatar do topo não encontrado" }
  }
  if ($html -match 'lh3\.googleusercontent\.com/aida/') { throw "$($p.tela): ainda há imagem privada do Stitch" }

  $i = $html.LastIndexOf('</body>')
  if ($i -lt 0) { throw "$($p.tela): </body> não encontrado" }
  $html = $html.Insert($i, '<script src="assets/prototipo.js"></script>')

  [IO.File]::WriteAllText((Join-Path $destino $p.arquivo), $html, $utf8)
  "$($p.arquivo) <- $($p.tela)"
}
