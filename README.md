# Sistema de Monitoramento do Rio Doce
> Sistema Front-end em Vue.js para apresentação de dados em mapa e tabela com a configuração feita através de filtros.

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads Stats][npm-downloads]][npm-url]

O sistema tem como objetivo apresentar de forma gráfica as medições feitas a respeito de parâmetros de qualidade de água e armazenadas em uma _triplestore_ Stardog com a utilização da ontologia [Integradoce][integradoce].

![](/src/assets/homepage.png)

## Instalação

Para instalação do projeto, basta utilizar o seguinte comando:

```
npm install
```

## Execução

Para executar o projeto, basta utilizar o seguinte comando:

```
npm run serve
```

## Bibliotecas e Frameworks utilizadas

* Vue.js – Framework principal para construção das páginas;

* Vuetify - Framework UI que disponibiliza diversos componentes prontos em CSS;

* Stardog.js - Biblioteca JavaScript que permite a conexão entre o sistema com a base de triplas Stardog.js;

* OpenLayers - Biblioteca _open source_ que disponibiliza uma API para criação do mapa e manipulação de suas funcionalidades;

* VueJsonToCsv - Biblioteca capaz de converter objetos JSON para CSV, utilizado para a criação de arquivos CSV através dos dados da tabela.

![](/src/assets/vue-family.png)

## Componentes

### Componente do Mapa

Onde todos os pontos de todas as medições estão dispersos, sendo possível clicar sob eles para ser capaz de os selecionar e os utilizar como condição para os filtros.

![](/src/assets/map-all-points.png)

### Componente da Tabela

Todas as informações a respeito das medições são apresentadas neste componente, tendo a possibilidade de baixar as informações da tabela através do botão "Baixar CSV". Qualquer ponto geográfico da tabela também é clicável e capaz de selecionar um ponto do mapa.

![](/src/assets/datatable.png)

### Componente dos Filtros

Componente capaz de buscar e filtrar os dados apresentados nos outros dois componentes principais. Sendo os campos de data inicial e final, responsável pela medição, parâmetro da qualidade de água e qualquer ponto geográfico utilizados como parâmetro para a busca na base de triplas Stardog.

![](/src/assets/filters.png)

## Meta

Dhiego Broetto – dhiegobroetto@gmail.com

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

[https://github.com/dhiegobroetto](https://github.com/dhiegobroetto)

## Contributing

1. Faça o _fork_ do projeto (<https://github.com/yourname/yourproject/fork>)
2. Crie uma _branch_ para sua modificação (`git checkout -b feature/fooBar`)
3. Faça o _commit_ (`git commit -am 'Add some fooBar'`)
4. _Push_ (`git push origin feature/fooBar`)
5. Crie um novo _Pull Request_

[npm-image]: https://img.shields.io/npm/v/datadog-metrics.svg?style=flat-square
[npm-url]: https://npmjs.org/package/datadog-metrics
[npm-downloads]: https://img.shields.io/npm/dm/datadog-metrics.svg?style=flat-square
[travis-image]: https://img.shields.io/travis/dbader/node-datadog-metrics/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/dbader/node-datadog-metrics
[integradoce]: https://nemo.inf.ufes.br/projetos/integradoce/