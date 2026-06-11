# Modelo de Domínio — Astrologica Engine

## 1. Objetivo

Este documento define o modelo de domínio inicial do Astrologica Engine.

Nesta primeira tarefa, o sistema contém apenas:

- Estruturas fundamentais do projeto.
- Dados astronômicos.
- Casas astrológicas.
- Ângulos do mapa.
- Estruturas preparatórias para objetos futuros.

Este documento não implementa regras de interpretação astrológica.

---

## 2. Separação das camadas

O projeto deve manter três categorias de dados rigorosamente separadas.

### RAW_DATA

Dados obtidos diretamente da entrada do usuário ou calculados pela Swiss Ephemeris.

Exemplos:

- Data e hora.
- Coordenadas geográficas.
- Longitude e latitude eclípticas.
- Declinação.
- Ascensão reta.
- Velocidade.
- Cúspides das casas.
- Ascendente.
- Meio do Céu.
- Vertex.

### GEOMETRIC_DERIVED

Dados produzidos por operações geométricas realizadas sobre os dados astronômicos.

Exemplos futuros:

- Casa ocupada por um objeto.
- Distância angular.
- Aspectos.
- Paralelos.
- Contraparalelos.
- Orientalidade.
- Ocidentalidade.

Nesta tarefa, somente o campo `house` será preparado como dado geométrico derivado.

### ASTROLOGICAL_DERIVED

Dados que dependem de regras, tradições ou interpretações astrológicas.

Exemplos futuros:

- Dignidades.
- Recepção.
- Dispositores.
- Almuten.
- Sect.
- Hayz.
- Haym.
- Lots derivados.
- Hyleg.
- Alcocoden.
- Kurios.
- Oikodespotes.

Nenhuma dessas regras será calculada nesta tarefa.

---

## 3. Tipos de objetos celestes

Todo objeto celeste deve possuir um dos seguintes tipos:

| Tipo | Descrição |
|---|---|
| `PLANET` | Planeta ou luminar |
| `NODE` | Nodo lunar |
| `ASTEROID` | Asteroide ou corpo menor |
| `LOT` | Parte ou lot astrológico |
| `FIXED_STAR` | Estrela fixa |
| `ANGLE` | Ângulo do mapa |
| `ECLIPSE_POINT` | Ponto relacionado a eclipse |

---

## 4. Entidade base: CelestialObject

`CelestialObject` é a entidade principal do modelo.

Todos os objetos celestes devem utilizar essa estrutura como base.

### Atributos

| Atributo | Tipo | Classificação | Descrição |
|---|---|---|---|
| `id` | string | RAW_DATA | Identificador interno único |
| `name` | string | RAW_DATA | Nome padronizado do objeto |
| `type` | string | RAW_DATA | Tipo do objeto celeste |
| `longitude` | number ou null | RAW_DATA | Longitude eclíptica em graus |
| `latitude` | number ou null | RAW_DATA | Latitude eclíptica em graus |
| `declination` | number ou null | RAW_DATA | Declinação equatorial em graus |
| `right_ascension` | number ou null | RAW_DATA | Ascensão reta em graus |
| `speed` | number ou null | RAW_DATA | Velocidade diária em longitude |
| `house` | number ou null | GEOMETRIC_DERIVED | Casa ocupada pelo objeto |

### Regras

- A longitude deve ser normalizada entre `0` e menos de `360` graus.
- A casa, quando disponível, deve ser um número inteiro entre `1` e `12`.
- Campos ainda não calculados devem possuir o valor `null`.
- A camada Astronomy Core não pode acrescentar interpretações astrológicas.
- O campo `house` depende da longitude do objeto e das cúspides das casas.

---

## 5. Planet

Representa um planeta ou luminar.

Planet herda todos os atributos de `CelestialObject`.

### Objetos suportados

- `SOL`
- `LUA`
- `MERCURIO`
- `VENUS`
- `MARTE`
- `JUPITER`
- `SATURNO`
- `URANO`
- `NETUNO`
- `PLUTAO`

### Atributos próprios

Planet não possui atributos adicionais nesta tarefa.

Todos os seus atributos são herdados de `CelestialObject`.

### Tipo obrigatório

```text
PLANET
