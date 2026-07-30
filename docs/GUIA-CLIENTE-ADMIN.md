# Zelo Admin — Guia do Cliente

Este documento apresenta, em linguagem simples, o que é o **Zelo Admin** e o que cada
área do painel faz. Serve como material de apresentação para entender, sem termos
técnicos, como este painel comanda toda a plataforma Zelo.

---

## O que é o Zelo Admin?

O **Zelo** é uma plataforma que organiza o cuidado de idosos, conectando **famílias**,
**cuidadores** e **clínicas**. O **Zelo Admin** é o **painel da plataforma** — usado
pela **equipe Zelo (super administradores)** para gerir **todas as clínicas** cadastradas.

É o nível mais alto do sistema. Enquanto cada clínica administra a sua própria
operação no **Zelo Clinic**, e famílias e cuidadores usam o **aplicativo**, o Zelo
Admin enxerga e governa **a plataforma inteira**: quem são as clínicas, quanto elas
pagam pela Zelo, os leads que chegam, e a qualidade do cuidado em toda a rede.

### Os três níveis da plataforma

| Painel / App          | Quem usa                         | Escopo                         |
| --------------------- | -------------------------------- | ------------------------------ |
| **Zelo Admin** (este) | Equipe Zelo (super admin)        | **Global** — todas as clínicas |
| **Zelo Clinic**       | Admin e enfermeiro(a) da clínica | Uma clínica específica         |
| **Zelo App**          | Famílias e cuidadores            | O cuidado no dia a dia         |

---

## Duas grandes responsabilidades

O Zelo Admin acumula dois papéis:

1. **Gestão do negócio (a Zelo como plataforma / SaaS)** — clínicas, leads, planos,
   assinaturas e pagamentos das clínicas para a Zelo.
2. **Supervisão do cuidado (visão global)** — pacientes, turnos, checklists, horas,
   qualidade e emergências em **todas** as clínicas.

---

## As áreas do painel (menu lateral)

### 📊 Dashboard

A visão executiva da plataforma inteira.

- Indicadores globais consolidados de todas as clínicas.
- Ranking das clínicas (top 10).
- **Projeção de receita** — forecast de 6 meses e receita anual projetada.
- Atividades recentes na plataforma.

### 🏢 Clínicas

O cadastro central de todas as clínicas da rede.

- Lista completa das clínicas cadastradas.
- Informações de contato, endereço e dados de cada instituição.
- Situação da assinatura e alertas SOS por clínica.
- Ativar, desativar ou excluir uma clínica.

### 📥 Leads

As oportunidades comerciais que chegam pela landing page.

- Leads recebidos pelo site institucional da Zelo.
- Filtro por status.
- **Conversão do lead em convite** para virar uma clínica cadastrada.

### 💳 Assinaturas

A gestão das assinaturas das clínicas na plataforma.

- Assinaturas ativas e expiradas.
- Distribuição das clínicas por plano.
- Ciclo de cobrança e data de expiração.
- Ajustes como **estender o período de teste (trial)** e alterar datas de vigência.

### 💵 Pagamentos

O acompanhamento financeiro das cobranças às clínicas.

- Total de cobranças e pagamentos confirmados.
- Pagamentos que falharam e exigem ação.
- Histórico por clínica.

### ✅ Planos

O catálogo dos planos oferecidos às clínicas.

- Criação e edição dos planos (mensal e anual).
- Preços, escopo, benefícios e disponibilidade de cada plano.

### 👥 Usuários

A gestão de contas na plataforma.

- Todos os usuários, incluindo administradores de clínica.
- Dados e permissões de cada conta.

### 🧑‍⚕️ Pacientes

A visão global dos pacientes atendidos na rede.

- Lista consolidada de pacientes de **todas** as clínicas.
- Prontuário e informações de cuidado.

### 📅 Turnos

A visão global das escalas.

- Turnos de todas as clínicas.
- Criação e edição de turnos.

### 📋 Checklists

Os protocolos de cuidado no nível da plataforma.

- Checklists usados na rede (incluindo os modelos globais).

### ⏱️ Horas

O controle de horas dos cuidadores em toda a rede.

- Horas trabalhadas consolidadas por cuidador.

### 📈 Relatórios

A inteligência gerencial da plataforma.

- Relatórios consolidados de operação e desempenho.

### ✔️ Conformidade

A supervisão da qualidade do cuidado.

- **Conformidade média** dos protocolos e turnos avaliados.
- **Conformidade por cuidador**, destacando quem está abaixo do ideal (< 70%).
- Registros de verificação de protocolo em toda a rede.

### 🛡️ Logs de Auditoria

O registro de segurança e rastreabilidade global.

- Histórico de todas as ações sensíveis na plataforma.
- Quem fez o quê e quando — transparência e conformidade.

### 📣 Broadcast

O envio de comunicados em massa.

- Notificações enviadas para grupos, como **administradores de clínica** e
  **contatos de emergência**.
- Ideal para avisos, novidades e comunicados da plataforma.

### 💬 Feedbacks

As avaliações e retornos de toda a rede.

- Feedback consolidado das famílias sobre o serviço.

### 🚨 SOS

O monitoramento **global** de emergências.

- Todos os alertas SOS disparados em qualquer clínica.
- Acompanhamento e histórico das ocorrências.

### ⚙️ Configurações

Os ajustes gerais da plataforma.

- Parâmetros e preferências do sistema.

---

## Pagamentos com o Asaas

A Zelo usa o **Asaas** (plataforma de pagamentos) como meio de cobrança. Na plataforma
existem **dois fluxos de dinheiro**, e o Zelo Admin acompanha principalmente o segundo:

| Fluxo                       | De quem → para quem                    | Onde é acompanhado                        |
| --------------------------- | -------------------------------------- | ----------------------------------------- |
| Pagamento do **cuidado**    | Família → Clínica (PIX)                | No painel de cada clínica (Zelo Clinic)   |
| Pagamento da **assinatura** | Clínica → Zelo (PIX, cartão ou boleto) | Aqui, em **Assinaturas** e **Pagamentos** |

### Como a Zelo recebe das clínicas

- Cada clínica escolhe um **plano** (área **Planos**) e assina.
- A cobrança é feita via **Asaas**, por **PIX, cartão de crédito ou boleto**, em ciclo
  **mensal, trimestral ou anual**.
- O plano da clínica é **ativado quando o pagamento é confirmado**.
- Em **Pagamentos**, a equipe Zelo vê as cobranças confirmadas, pendentes e as que
  **falharam** (exigindo ação).
- Se a clínica fica **inadimplente**, o acesso pago é **suspenso/rebaixado** após o
  período de tolerância.
- Em **Assinaturas** é possível gerir vigências, **estender o período de teste (trial)**
  e acompanhar a distribuição das clínicas por plano.

> O pagamento que a **família** faz à **clínica** (pelo cuidado) **não** passa pela
> conta da Zelo — cai direto na conta Asaas de cada clínica. A Zelo só recebe as
> **assinaturas** das clínicas.

---

## O ciclo de uma clínica na plataforma

```
1. Lead chega pela landing page ─────────►  LEADS
2. Lead convertido em convite ───────────►  vira uma CLÍNICA cadastrada
3. Clínica escolhe um PLANO ─────────────►  gera uma ASSINATURA
4. Cobranças recorrentes ────────────────►  PAGAMENTOS
5. A Zelo supervisiona a operação  ──────►  Pacientes, Turnos, Conformidade, SOS
```

---

## Resumo

O Zelo Admin é a torre de comando da plataforma. Com ele, a equipe Zelo:

- **Gere o negócio** — leads, clínicas, planos, assinaturas e pagamentos.
- **Enxerga a rede inteira** — pacientes, turnos, horas e relatórios de todas as clínicas.
- **Garante a qualidade** — acompanha a conformidade dos cuidadores e responde a SOS globais.
- **Comunica em escala** — broadcasts para clínicas e contatos.
- **Mantém a governança** — auditoria completa de tudo que acontece.

> A operação de cada clínica acontece no **Zelo Clinic**, e o cuidado no dia a dia no
> **Zelo App** — ambos apresentados em guias separados.
> </content>
