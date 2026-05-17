# Sistema de Imagens para Apresentações

Este documento é lido por Claude durante o Step 4b do fluxo de criação.  
Define as regras de seleção, distribuição, geração de prompt e integração das imagens.

---

## 1. Regras de quantidade máxima

| Total de slides | Máximo de imagens |
|---|---|
| Até 10 | 4 |
| 11 a 20 | 7 |
| 21 a 30 | 10 |
| 31 a 40 | 13 |
| Fórmula geral | `floor(N × 0.35)` |

---

## 2. Regras de distribuição

- **Nunca** dois slides consecutivos com imagem
- **Capa** (`cover`) → **sempre** recebe imagem
- **Contracapa** (`closing`) → **nunca** recebe imagem (design próprio fixo)
- Após definir os slides elegíveis, distribuir de forma intercalada com espaçamento mínimo de 2 slides entre imagens

---

## 3. Prioridade de slides elegíveis para imagem

### Alta prioridade (candidatos preferenciais)
| Tipo | Critério |
|---|---|
| `cover` | Sempre — obrigatório |
| `turning-point` | Recebe imagem em 50% dos casos (intercalado) |
| `statement` | Recebe imagem em 33% dos casos |
| `context` | Elegível se houver cota disponível |
| `opportunity` | Elegível se houver cota disponível |
| `example` | Elegível se houver cota disponível |
| `concept` | Elegível se houver cota disponível |
| `principle` | Elegível se houver cota disponível |

### Nunca recebem imagem
| Tipo | Motivo |
|---|---|
| `stats` | Layout de números em destaque |
| `framework` | Grid de cards estruturado |
| `decision` | Matriz visual própria |
| `action-plan` | Timeline de cards |
| `benefits` | Grid de cards |
| `recommendations` | Grid de cards |
| `risks` | Layout de estatísticas |
| `leaders` | Grid de cards |
| `closing` | Design próprio fixo |

---

## 4. Algoritmo de seleção (passo a passo)

```
1. Calcular M = floor(N × 0.35) — máximo de imagens
2. Slide 01 (cover) → imagem garantida. M restante = M - 1
3. Listar slides elegíveis (excluindo tipos bloqueados e closing)
4. Ordenar por prioridade (turning-point > statement > outros)
5. Percorrer a lista e selecionar slides respeitando:
   - Distância mínima de 2 slides entre imagens
   - Respeitar M restante
6. Se o usuário tiver pedido imagem específica em algum slide → priorizar
```

---

## 5. Prompt de conteúdo por slide

Para cada slide selecionado, gerar um **content prompt** baseado no conteúdo do slide.

### Estrutura do content prompt

```
[objeto ou cena que representa o tema] + [características visuais específicas]
```

### Critérios para o objeto

- Deve ser um **objeto físico realista** que traduza o conceito do slide
- Não usar pessoas, rostos ou texto visível na imagem
- Não usar ícones, ilustrações planas, pictogramas, símbolos genéricos, mascotes, desenhos cartoonizados ou elementos decorativos excessivos
- Não representar conceitos de forma literal, genérica ou simbólica
- Traduzir o tema em objeto com aparência de produto, máquina, módulo, estrutura técnica, peça de engenharia, dispositivo, maquete ou artefato físico
- Exemplos de mapeamento conceito → objeto:

| Conceito do slide | Objeto sugerido |
|---|---|
| Modelo de Gestão / DNA da organização | Estrutura molecular 3D / engrenagem complexa |
| Planejamento Estratégico | Bússola / mapa com rotas traçadas |
| Direção / Norte estratégico | Bússola isolada / seta de direção |
| Recursos / Alocação | Balança de precisão / blocos empilhados |
| Ciclo / Processo contínuo | Roda de engrenagens em ciclo |
| Framework / Estrutura | Cubo com divisões internas |
| Diagnóstico / Análise | Lupa sobre superfície / scanner 3D |
| SWOT / Mapeamento | Grade dividida em 4 quadrantes |
| Virada / Ponto de mudança | Dobradiça / alavanca em metal |
| Pausa / Descanso | Ampulheta / relógio parado |
| Encerramento / Movimento | Seta em movimento / trajetória |

---

## 6. Prompt base de estilo visual

> Direção visual oficial fornecida pelo usuário. Usar como base para todas as imagens.

### Estética geral

- Estética minimalista, técnica, premium e futurista
- Foco em objetos físicos realistas, tangíveis e visualmente sofisticados
- Aparência de produto, máquina, módulo, estrutura técnica, peça de engenharia, dispositivo, maquete ou artefato físico
- O objeto deve parecer real, fotografável, industrialmente desenhado e materialmente plausível
- Visual de fotografia de produto 3D hiper-realista, com acabamento limpo, sofisticado e futurista
- Presença premium, como se o objeto tivesse sido projetado por um estúdio de design industrial de alto nível

### Paleta e materiais

- Paleta predominantemente composta por light gray, branco fosco levemente brilhante, prata fosco, branco frio, metal claro, vidro translúcido, acrílico, superfícies acetinadas e detalhes sutis em cinza escuro
- Cores controladas, discretas e pouco saturadas
- Evitar aparência extremamente colorida, infantil, lúdica, exagerada ou ornamental
- Materiais bem definidos: branco fosco premium, metal acetinado, vidro, acrílico, polímeros técnicos, superfícies usinadas, encaixes precisos
- Não transformar todas as imagens em objetos metálicos. O metal deve ser acento estrutural, não o material dominante em todos os casos
- Equilibrar materiais técnicos com elementos naturais/orgânicos quando o conceito pedir vida, crescimento, território, ecossistema ou desenvolvimento
- Elementos naturais devem ser conceituais e controlados: microvegetação, terreno de maquete, árvores em escala, relevos, caminhos e superfícies orgânicas. Não inserir árvores genéricas sem função narrativa

### Composição e iluminação

- Composição minimalista, com poucos elementos, bastante respiro visual e foco total no objeto principal
- Transmitir precisão, tecnologia, engenharia, clareza, controle e sofisticação
- Iluminação suave, cinematográfica e controlada
- Sombras realistas, reflexos delicados, ultra detalhe e acabamento de render 3D realista de altíssima qualidade
- Aparência limpa, premium, moderna, tecnológica, técnica e edge
- O objeto precisa ser entendível. Evitar peças futuristas abstratas que parecem sofisticadas mas não comunicam a mensagem do slide
- A imagem deve ter leitura conceitual clara em até alguns segundos: o usuário deve entender por que aquele objeto existe naquele slide

### Fundo e transparência

- O arquivo final deve ser PNG com transparência real no canal alpha
- Não usar fundo sólido, fundo falso, fundo branco, fundo cinza ou simulação visual de transparência no arquivo final
- O objeto deve estar isolado para aplicação em diferentes layouts e documentos
- Se a ferramenta de geração produzir fundo visível, a imagem deve ser rejeitada ou convertida para PNG com alpha real antes de ser integrada ao projeto

### Aplicação nos slides

- Imagens com alpha real são objetos soltos no layout, não fotos de fundo
- Nunca aplicar `object-cover`, crop, máscara, frame com `overflow-hidden` ou qualquer container que corte o objeto
- A imagem deve manter proporção original e aparecer inteira
- Posicionar a imagem em uma área livre do slide, geralmente lateral direita ou canto livre, sem disputar espaço com título, corpo, cards ou gráficos
- Se a imagem não couber, reduzir escala ou reposicionar; não cortar
- A imagem deve dialogar com o tema específico da página onde aparece, mas sem repetir texto ou virar símbolo literal

### Restrições permanentes

- Não usar pessoas, rostos, logos, ícones, pictogramas, ilustrações planas, cartoon, mascotes ou símbolos genéricos
- Texto grande, flutuante ou de interface é proibido. Texto gravado em baixo relevo, microtipografia técnica ou rótulos discretos na própria peça são permitidos quando ajudam a tornar o conceito entendível
- Não usar metáforas óbvias demais quando uma peça técnica, módulo ou artefato físico puder representar o tema com mais sofisticação
- Não adicionar elementos decorativos sem função visual clara
- Não criar objetos tecnológicos sem função aparente. Cada módulo, conexão, núcleo, caminho ou detalhe deve reforçar o tema do slide

### Referências visuais

Usar como referência os arquivos da pasta `IMAGENS REFERENCIA/`:

- `Brasil 2 Moinho.png`
- `Brasil 4.png`
- `Brasil 3.png`
- `Brasil 2.png`

Leitura das referências:

- `Brasil 2 Moinho.png`: objeto branco fosco, limpo, com elemento natural orgânico na base; tecnologia e natureza em equilíbrio
- `Brasil 2.png`: maquete territorial rica, com cidade, rios, vegetação, infraestrutura e peças brancas futuristas; o objeto comunica ecossistema, não apenas tecnologia
- `Brasil 3.png`: produto claro, branco/prata, com aparência real e função compreensível
- `Brasil 4.png`: sistema técnico detalhado, com módulos transparentes, partes brancas/prata e textos gravados de baixo relevo para dar leitura ao conceito

Antes de gerar imagens de uma apresentação específica, coletar apenas ajustes adicionais:

- Se há alguma referência específica para aquela apresentação
- Se algum slide precisa fugir parcialmente do padrão
- Se algum objeto, material ou direção visual deve ser evitado

O prompt final de cada imagem será:

```
[DIREÇÃO VISUAL OFICIAL] + [REFERÊNCIAS VISUAIS] + [AJUSTES DA APRESENTAÇÃO] + [CONTENT PROMPT DO SLIDE]
```

---

## 7. Geração via Codex/imagegen

> Não usar chamada manual de API nem exigir `OPENAI_API_KEY`.  
> As imagens são geradas pelo Codex nesta conversa e depois salvas no projeto.

### Após gerar cada imagem

1. Revisar a imagem contra o plano aprovado
2. Ajustar por iteração se houver pedido do usuário
3. Salvar a imagem final em `Imagens/[slug]/slide-[NN].png`
4. Atualizar o slide correspondente em `user-presentations.ts` com o caminho da imagem

### Convenção de nomes de arquivo

```
/Imagens/[slug]/slide-[NN].png
```

Exemplo: `/Imagens/modelo-gestao/slide-01.png`

---

## 8. Atualização do slide após geração

Após download, atualizar o slide em `user-presentations.ts`:

```typescript
// Adicionar ao topo do arquivo
import slide01Image from "../../../Imagens/modelo-gestao/slide-01.png";

// No slide correspondente, adicionar:
imageSrc: slide01Image,
imageAlt: "[descrição acessível da imagem]",
```

---

## 9. Ordem de execução no fluxo geral

```
Step 5 — Criar todos os slides (texto completo)
         ↓
Step 4b — Definir plano de imagens (este documento)
         ↓
Step 4c — Usuário aprova quais slides terão imagem
         ↓
Step 6  — Gerar imagens via Codex e integrar nos slides
         ↓
Step 6b — Confirmar apresentação completa ao usuário
```

> **Nota:** A criação dos slides (Step 5) vem antes das imagens.  
> Só após os slides estarem criados e aprovados é que as imagens são geradas e inseridas.
