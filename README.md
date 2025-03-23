# Finanças Pessoais

Uma aplicação web moderna para gerenciamento de finanças pessoais, construída com Next.js 14, Supabase e Tailwind CSS.

## Funcionalidades

- ✨ Interface moderna e responsiva
- 📊 Dashboard com gráficos e análises
- 💰 Gerenciamento de transações
- 📅 Agendamento de pagamentos
- 🏷️ Categorização de despesas
- 🌙 Tema claro/escuro
- 🔒 Autenticação segura
- 📱 Design mobile-first

## Tecnologias

- [Next.js 14](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Query](https://tanstack.com/query/latest)
- [date-fns](https://date-fns.org/)

## Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

## Instalação

1. Clone o repositório:
\`\`\`bash
git clone https://seu-repositorio/financas-pessoais.git
cd financas-pessoais
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
# ou
yarn install
\`\`\`

3. Configure as variáveis de ambiente:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Preencha as variáveis no arquivo .env.local com suas credenciais do Supabase

5. Execute o projeto em desenvolvimento:
\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

## Deploy

### Vercel (Recomendado)

1. Crie uma conta na [Vercel](https://vercel.com)
2. Conecte seu repositório
3. Configure as variáveis de ambiente
4. Deploy automático

### Hospedagem Própria

1. Build do projeto:
\`\`\`bash
npm run build
# ou
yarn build
\`\`\`

2. Inicie o servidor:
\`\`\`bash
npm start
# ou
yarn start
\`\`\`

## Estrutura do Banco de Dados

O projeto utiliza Supabase como banco de dados. As principais tabelas são:

- \`transactions\`: Registro de transações
- \`scheduled_payments\`: Pagamentos agendados
- \`categories\`: Categorias de transações
- \`profiles\`: Informações dos usuários

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Suporte

Para suporte, envie um email para seu-email@dominio.com ou abra uma issue no GitHub. 