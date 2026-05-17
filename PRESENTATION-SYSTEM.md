# Sistema de Criação de Apresentações Comerciais

Este documento é lido por Claude antes de iniciar qualquer criação de apresentação.  
Siga os steps na ordem. Não pule etapas.

---

## Gatilho de entrada

Qualquer mensagem do usuário que contenha termos como:
- "criar apresentação", "nova apresentação", "iniciar apresentação"
- "quero uma apresentação", "gerar slides", "montar uma apresentação"
- ou qualquer variação semelhante

→ **Ler este documento completo antes de responder.**  
→ Responder com o **Step 1**.

---

## Step 1 — Perguntar o tema

Responda exatamente assim (adapte o tom, mas mantenha a estrutura):

> Claro! Antes de começar, me conta:  
> **Qual é a apresentação que você quer criar hoje?**  
>  
> Pode me enviar o conteúdo como quiser — texto corrido, dividido por páginas, tópicos, ou uma mistura de tudo. Quanto mais contexto, melhor o resultado.

---

## Step 2 — Análise do conteúdo recebido

Quando o usuário enviar o conteúdo, analise:

### 2a — O usuário separou por páginas?

**SIM** → Perguntar:

> Percebi que você organizou o conteúdo em [N] páginas. Tenho duas opções para você:
>
> **Opção A — Manter sua estrutura**  
> Respeitamos exatamente as [N] páginas que você definiu. O risco é que algumas páginas possam ter texto demais ou de menos para o design funcionar bem.
>
> **Opção B — Distribuição recomendada** *(recomendado)*  
> Analisamos o volume de cada bloco e distribuímos o conteúdo nas páginas mais adequadas. Isso garante que cada página tenha a quantidade certa de texto para o layout respirar.
>
> Qual prefere?

**NÃO** (texto corrido ou tópicos misturados) → Seguir automaticamente com a distribuição recomendada (não perguntar, apenas avisar no Step 3).

---

## Step 3 — Mapeamento de páginas

### Regras de análise de conteúdo

Para cada bloco de texto identificado, verifique:

1. **Volume textual** — quantos caracteres tem o bloco?
2. **Natureza do conteúdo** — é uma afirmação? dados? passos? exemplo?
3. **Cruzar com o Mapeamento de Páginas** (ver seção abaixo) para encontrar o tipo de página mais adequado.

### Critérios de encaixe

| Conteúdo identificado | Tipo de página sugerido |
|---|---|
| Título + subtítulo da apresentação | 01 — Capa |
| Afirmação central / tese de uma linha | 02 — Tese com citação |
| Contexto de mercado + dado de linha | 03 — Contexto + gráfico de linha |
| Problema / diagnóstico + dado de barras | 04 — Problema + gráfico de barras |
| Comportamento do cliente + foto | 05 — Texto + imagem editorial |
| Oportunidade + dado de barras | 06 — Oportunidade + gráfico |
| Três estatísticas / números de impacto | 07 — Estatísticas em destaque |
| Framework com 4 pilares | 08 — Framework em cards |
| Princípio estratégico / citação de insight | 09 — Princípio com citação |
| Caso prático / exemplo aplicado + dado | 10 — Exemplo + gráfico de linha |
| Três práticas ou atributos de liderança | 11 — Cards de destaque |
| Critérios de decisão (4 eixos) | 12 — Mapa em cards |
| Conceito central + lista de apoio | 13 — Conceito + imagem |
| Ponto de virada / tensão máxima | 14 — Virada em destaque |
| Sequência de 4 passos / plano de ação | 15 — Plano em cards |
| Benefícios esperados (3 blocos) | 16 — Benefícios em cards |
| Riscos / consequências de não agir | 17 — Riscos em estatísticas |
| Recomendações para liderança (3) | 18 — Recomendações em cards |
| Chamada para ação + próximos passos | 19 — Chamada + gráfico |
| Encerramento / frase final | 20 — Contracapa |

### Regras de ajuste de texto

- **Título** → pode condensar até encontrar o limite de caracteres do tipo de página
- **Subtítulo / corpo** → pode reorganizar a ordem das frases, mas não pode inventar conteúdo
- **Limite ultrapassado** → dividir em duas páginas do tipo mais adequado, nunca cortar conteúdo
- **Conteúdo escasso** → manter na página mais simples disponível (ex: sem gráfico se não há dados)
- **Máximo de 2 palavras adicionadas** por campo para encaixar no limite — nunca mais que isso
- **Conteúdo importante não cabe** → criar nova página, novo bloco, novo layout ou nova implementação compatível com o design system; nunca esconder conteúdo por limitação do componente
- **Novas implementações são permitidas** quando necessárias para preservar conteúdo, desde que sigam os princípios do design system: clareza, respiro, hierarquia, consistência visual e ausência de excesso decorativo
- **Gráficos só podem existir com dados reais, fonte explícita ou números fornecidos pelo usuário**; se não houver base, usar cards, lista, diagrama conceitual ou texto estruturado, nunca porcentagens ou séries inventadas
- **Dados estimados ou ilustrativos** só podem aparecer se o slide deixar isso explícito e o usuário aprovar
- **Primeira página / capa** → a section principal deve usar chanfro (`ChamferedPanel`) com stroke claro, mantendo a linguagem visual do sistema

---

## Step 4 — Preview do mapeamento para aprovação

Antes de criar, mostrar ao usuário uma tabela como esta:

```
MAPEAMENTO DA APRESENTAÇÃO: [Nome]

Pág  Tipo                          Conteúdo
──────────────────────────────────────────────────────
01   Capa                          "[Título]" + "[Subtítulo]"
02   Tese com citação              "[Primeiros 60 chars da tese]..."
03   Contexto + gráfico de linha   "[Primeiro parágrafo do contexto]..."
...
NN   Contracapa                    "[Frase de encerramento]"

Total: NN páginas
```

Perguntar: **"Posso seguir com essa estrutura?"**

Aguardar aprovação antes de qualquer criação.

---

## Step 4b — Plano de imagens

> Executar **após** o usuário aprovar o mapeamento de páginas (Step 4).  
> Ler `IMAGE-SYSTEM.md` antes de executar este step.

### 4b.1 — Calcular máximo de imagens

Usar a fórmula: `M = floor(N × 0.35)` onde N = total de slides.

### 4b.2 — Selecionar slides com imagem

Seguir o algoritmo de seleção do `IMAGE-SYSTEM.md`:
- Capa sempre recebe imagem
- Priorizar turning-point e statement
- Nunca dois consecutivos
- Nunca types bloqueados (stats, framework, decision, action-plan, etc.)

### 4b.3 — Definir o content prompt de cada imagem

Para cada slide selecionado, definir:
- Qual objeto/cena representa o tema
- O content prompt exato que será usado na geração

### 4b.4 — Apresentar plano ao usuário

Mostrar tabela como esta:

```
PLANO DE IMAGENS — [Nome da Apresentação]
──────────────────────────────────────────────────────────
Pág  Tipo              Imagem planejada
──────────────────────────────────────────────────────────
01   Capa              Estrutura molecular 3D representando
                       o DNA de uma organização
...
NN   [tipo]            [descrição da imagem]
──────────────────────────────────────────────────────────
Total: X imagens de N slides
```

Perguntar: **"Aprova este plano de imagens? Quer alterar alguma?"**

---

## Step 4c — Aprovação do plano de imagens

Aguardar confirmação do usuário.

- Se aprovar → seguir para Step 5
- Se pedir alteração → ajustar slides/imagens e reapresentar
- Se pedir imagem extra em slide específico → adicionar respeitando a regra de não-consecutividade

---

## Step 5 — Criação da apresentação

Após aprovação, criar o arquivo de dados seguindo exatamente esta estrutura TypeScript.

### Arquivo alvo
`src/data/commercial-presentations/user-presentations.ts`

### Estrutura de um slide

```typescript
{
  id: "[slug]-[NN]",          // ex: "minha-apresentacao-01"
  type: "[tipo]",              // ver CommercialSlideType
  visual: "[visual]",          // ver CommercialSlideVisual
  eyebrow: "[NN] / [total] - [Label do tipo]",
  footer: "MASI Negócios - Design System",
  title: "[título]",
  subtitle: "[subtítulo opcional]",
  body: "[corpo de texto]",
  quote: "[citação opcional]",
  bullets: ["item 1", "item 2"],   // opcional
  stats: [{ value: "X", label: "legenda" }],  // opcional
  cards: [{ title: "T", description: "D" }],  // opcional
  chart: {                        // opcional
    type: "bar" | "line",
    valueLabel: "label do eixo",
    data: [{ label: "L", value: N }],
  },
}
```

### Mapa tipo → visual

| type | visual |
|---|---|
| cover | editorial |
| statement | quote |
| context | split |
| problem | dark |
| behavior | map |
| opportunity | editorial |
| stats | stats |
| framework | matrix |
| principle | quote |
| example | split |
| leaders | cards |
| decision | matrix |
| concept | map |
| turning-point | dark |
| action-plan | timeline |
| benefits | cards |
| risks | stats |
| recommendations | cards |
| cta | editorial |
| closing | closing |

### Cores padrão

- accent: `"#5FC318"`
- darkAccent: `"#0C1C16"`

### Adicionar ao array `userPresentations`

```typescript
export const userPresentations: CommercialPresentation[] = [
  {
    id: "user-[slug]",
    slug: "[slug]",
    title: "[Título\nda\nApresentação]",
    subtitle: "[subtítulo]",
    description: "[descrição curta]",
    theme: "[tema]",
    style: "Editorial institucional",
    useCase: "[caso de uso]",
    accent: "#5FC318",
    darkAccent: "#0C1C16",
    tags: ["tag1", "tag2"],
    slides: [ ...slides ],
  },
];
```

---

## Step 6 — Geração de imagens via Codex

> Executar **após** Step 5 (slides criados) e Step 4c (plano aprovado).  
> A geração é conduzida aqui no Codex, usando briefing visual, referências e iterações com o usuário.  
> Não requer `OPENAI_API_KEY`, script local ou chamada manual de API.

### 6.1 — Verificar pré-requisitos

Antes de gerar, confirmar se o usuário já forneceu:

- Ajustes específicos da apresentação sobre a direção visual oficial do `IMAGE-SYSTEM.md`
- Referências visuais adicionais, se houver
- Objetos, materiais ou caminhos visuais que devem ser evitados naquela apresentação

Se faltar contexto específico, usar a direção visual oficial e perguntar apenas se há exceções:

> Vou usar a direção visual oficial do sistema. Tem alguma referência extra, material específico ou coisa que você queira evitar nesta apresentação?

### 6.2 — Preparar pasta de imagens do projeto

Criar a pasta final da apresentação:

```bash
mkdir -p "Imagens/[slug]"
```

### 6.3 — Gerar cada imagem

Para cada slide do plano aprovado:

1. Montar o prompt final com: `[DIREÇÃO VISUAL OFICIAL] + [REFERÊNCIAS] + [AJUSTES DA APRESENTAÇÃO] + [CONTENT PROMPT do slide]`
2. Gerar a imagem pelo Codex/imagegen
3. Revisar se a imagem respeita o conceito, o estilo e as restrições
4. Iterar uma vez por ajuste específico, se necessário
5. Salvar a imagem aprovada em `Imagens/[slug]/slide-[NN].png`
6. Atualizar o slide em `user-presentations.ts` com `imageSrc` e `imageAlt`

### 6.4 — Importar imagens no arquivo de dados

No topo de `user-presentations.ts`, adicionar os imports:

```typescript
import slide01Image from "../../../Imagens/[slug]/slide-01.png";
// ... demais slides com imagem
```

E nos slides correspondentes:
```typescript
imageSrc: slide01Image,
imageAlt: "[descrição acessível]",
```

### 6.5 — Confirmar ao usuário

Após todas as imagens geradas e integradas:

> ✅ Apresentação completa com imagens.  
> Acesse pelo menu (☰) → **"[Nome]"**  
>  
> **X imagens geradas** em N slides.  
> Próximo passo disponível: ajuste de imagens, revisão de conteúdo ou nova apresentação.

---

## Step 7 — Confirmação final

Após editar o arquivo, informar ao usuário:

> ✅ Apresentação criada com sucesso.  
> Acesse pelo menu (☰) na página inicial — procure por **"[Nome da Apresentação]"**.  
>  
> Próximo passo disponível: ajuste de estilo visual, revisão de conteúdo ou adição de dados aos gráficos.

---

## Limites de caracteres por tipo de página

| Pág | Tipo | Campo | Limite |
|---|---|---|---|
| 01 | Capa | Título | 31 car. |
| 01 | Capa | Subtítulo | 63 car. |
| 01 | Capa | Corpo | 125 car. |
| 02 | Tese com citação | Citação/Tese | 133 car. |
| 02 | Tese com citação | Corpo | 79 car. |
| 03 | Contexto + gráfico linha | Título | 24 car. |
| 03 | Contexto + gráfico linha | Corpo | 129 car. |
| 04 | Problema + gráfico barras | Título | 37 car. |
| 04 | Problema + gráfico barras | Corpo | 137 car. |
| 05 | Texto + imagem editorial | Título | 44 car. |
| 05 | Texto + imagem editorial | Corpo | 131 car. |
| 06 | Oportunidade + gráfico | Título | 30 car. |
| 06 | Oportunidade + gráfico | Corpo | 119 car. |
| 07 | Estatísticas em destaque | Título | 31 car. |
| 07 | Estatísticas em destaque | Corpo | 77 car. |
| 07 | Estatísticas em destaque | Stat valor | ~8 car. cada |
| 07 | Estatísticas em destaque | Stat legenda | ~70 car. cada |
| 08 | Framework em cards | Título | 41 car. |
| 08 | Framework em cards | Corpo | 85 car. |
| 08 | Framework em cards | Card título | ~10 car. cada |
| 08 | Framework em cards | Card descrição | ~50 car. cada |
| 09 | Princípio com citação | Título | 51 car. |
| 09 | Princípio com citação | Citação | 76 car. |
| 09 | Princípio com citação | Corpo | 89 car. |
| 10 | Exemplo + gráfico linha | Título | 32 car. |
| 10 | Exemplo + gráfico linha | Corpo | 130 car. |
| 11 | Cards de destaque | Título | 27 car. |
| 11 | Cards de destaque | Corpo | 122 car. |
| 11 | Cards de destaque | Card título | ~10 car. cada |
| 11 | Cards de destaque | Card descrição | ~46 car. cada |
| 12 | Mapa em cards | Título | 15 car. |
| 12 | Mapa em cards | Corpo | 70 car. |
| 13 | Conceito + imagem | Título | 31 car. |
| 13 | Conceito + imagem | Corpo | 102 car. |
| 14 | Virada em destaque | Título | 17 car. |
| 14 | Virada em destaque | Corpo | 109 car. |
| 14 | Virada em destaque | Citação | 43 car. |
| 15 | Plano em cards | Título | 34 car. |
| 15 | Plano em cards | Corpo | 61 car. |
| 16 | Benefícios em cards | Título | 20 car. |
| 16 | Benefícios em cards | Corpo | 92 car. |
| 17 | Riscos em estatísticas | Título | 18 car. |
| 17 | Riscos em estatísticas | Corpo | 89 car. |
| 18 | Recomendações em cards | Título | 30 car. |
| 18 | Recomendações em cards | Corpo | 81 car. |
| 19 | Chamada + gráfico | Título | 13 car. |
| 19 | Chamada + gráfico | Corpo | 65 car. |
| 20 | Contracapa | Título | 50 car. |
| 20 | Contracapa | Subtítulo | 31 car. |
| 20 | Contracapa | Corpo | 118 car. |
| 20 | Contracapa | Citação | 83 car. |
