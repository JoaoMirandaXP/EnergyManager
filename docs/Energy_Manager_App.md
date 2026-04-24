# 🔋 Energy Manager App

O **Energy Manager** é um "notebook de hábitos energéticos". Diferente de rastreadores de hábitos comuns, este foca em aplicar o rigor da **Engenharia de Energia** ao dia-a-dia, rastreando não só a duração das atividades, mas sim as métricas de potência real do usuário (seja elétrica ou biológica).

## 📌 Conceitos Fundamentais
1. **Potência (kW):** A velocidade na qual a energia é consumida. 
   - Ex: Um fogão elétrico consome 2kW.
   - Ex: Uma corrida intensa de bicicleta gera cerca de 515 kcal/h, o que equivale a ~0.6 kW. 
   - A conversão usada internamente: `1 kcal/h = 0.00116222 kW`.
2. **TEP (Tonelada Equivalente de Petróleo):** Unidade de medida usada globalmente para expressar grandes quantidades de energia. Usamos no app para ter uma dimensão do impacto real da sua energia consumida ao longo dos dias e meses (`1 kWh = 0.00008598 TEP`).
3. **Fator de Carga:** A razão entre a sua Potência Média diária e a sua Potência Máxima no mesmo dia. O objetivo é manter esse fator o mais alto possível para "achatar a curva" e manter a estabilidade no consumo/esforço diário.

## 🛠️ Stack Tecnológico
- **React Native / Expo (Router):** Framework principal do front-end.
- **Zustand:** Gerenciamento de estado global focado em escalabilidade. Usado nos "stores".
- **AsyncStorage:** Banco de dados simples NoSQL local para guardar os Equipamentos e Logs no próprio celular.
- **Expo FileSystem & Sharing:** Para permitir a exportação em `.csv` ou `.json` que podem ser importados no MATLAB ou Python para cálculos estatísticos profundos.

## 📂 Estrutura de Arquivos
- `/app/(tabs)/index.tsx`: O Dashboard (Curva Diária, Fator de Carga).
- `/app/(tabs)/objetos.tsx`: Gestão de Equipamentos e Hábitos (Cadastro com Watts ou kcal/h).
- `/app/(tabs)/logs.tsx`: Onde você anota "acabei de andar de bike por 30 mins". O app converte e registra no seu diário.
- `/app/(tabs)/settings.tsx`: Para as configurações de exportação de dados.
- `/src/store/useEnergyStore.ts`: O cérebro do app (regras de cálculo, Zustand e AsyncStorage).
- `/src/utils/energy.ts`: Constantes e funções de conversão física/matemática.

## 🚀 Como Iniciar e Rodar
1. Abra o terminal na pasta raiz: `/home/jvcm/codigo/estudos/react/pea3100`.
2. Instale dependências adicionais (caso necessário): `npm install`.
3. Rode o comando de inicialização: `npx expo start` ou `npm run start`.
4. Um QR Code aparecerá. Abra o app **Expo Go** no seu Android, escaneie o código, e o app será carregado instantaneamente.

## 🔮 Roadmap (Integração CalDAV)
A versão atual exporta dados e armazena localmente.
Para o futuro, a conexão com o **Servidor Radicale (`https://start/radicale/jvcm`)** via VPN deverá ser feita criando uma pequena **API REST Node.js intermediária**.
**Por que?** O CalDAV funciona lendo respostas XML complexas e WebDAV. Fazer essa leitura direta pelo frontend do React Native causa lentidão. Uma API intermediária pode extrair os eventos do seu calendário e convertê-los em JSON puro para o aplicativo consumir no formato dos `Logs` atuais.

