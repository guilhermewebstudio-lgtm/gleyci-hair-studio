# Gleyci Hair Studio — Guia de Publicação

## O que já está feito
- Site completo: hero animado, galeria, preços, marcações com horários fixos, login/registo, painel de gestão em `/gestao`
- Base de dados PostgreSQL (schema pronto em `db/migrate.js`)
- Bilingue PT/EN

## O que falta (vamos fazer juntos, passo a passo)
1. Enviares-me as fotos/vídeos reais do Instagram da Gleyci
2. Criar os 3 serviços online (GitHub, Neon, Render) — guia abaixo
3. Configurar o cron-job.org para o site não "adormecer"

---

## PASSO 1 — GitHub (guardar o código)
1. Entra em github.com com a conta `guilhermewebstudio-lgtm`
2. Cria um novo repositório: `gleyci-hair-studio` (privado ou público, tanto faz)
3. Eu faço o push do código diretamente — só preciso que confirmes que o repo está criado

## PASSO 2 — Neon (base de dados)
1. Entra em neon.tech e cria uma conta (ou usa a mesma dos outros projetos)
2. Cria um novo projeto: "Gleyci Hair Studio"
3. Copia o **Connection String** (algo como `postgresql://...`)
4. Envia-mo aqui para eu configurar

## PASSO 3 — Render (publicar o site)
1. Entra em render.com com a conta ligada ao GitHub
2. "New +" → "Web Service" → escolhe o repositório `gleyci-hair-studio`
3. Configurações:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Em "Environment Variables", adiciona:
   - `DATABASE_URL` = (o connection string do Neon)
   - `SESSION_SECRET` = qualquer texto secreto à tua escolha
5. Depois do deploy, corre uma vez o comando de migração (eu ajudo-te nisso via Render Shell, ou fazemos localmente antes do deploy)

## PASSO 4 — cron-job.org (manter o site ativo)
1. Cria conta em cron-job.org
2. Novo cronjob → URL: `https://[o-teu-site].onrender.com/api/health`
3. Intervalo: a cada 10 minutos

---

## Depois disto
Assim que tiveres os 3 links/credenciais (GitHub repo criado, Neon connection string, Render conectado), diz-me e eu:
- Faço o push do código
- Configuro as variáveis de ambiente
- Corro a migração da base de dados
- Confirmo que está tudo a funcionar em produção

A partir daí, qualquer alteração que precises, é só pedires-me aqui — eu edito, faço commit e publico automaticamente.
