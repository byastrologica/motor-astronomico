# Modelo de Domínio — Motor Astronômico

## 1. Objetivo

Este documento define as estruturas de dados da API pública Motor Astronômico.

O projeto utiliza a Swiss Ephemeris para produzir dados astronômicos brutos em formato JSON.

Este repositório não contém métodos, interpretações ou regras astrológicas proprietárias.

---

## 2. Classificação dos dados

### RAW_DATA

Informações recebidas na requisição ou obtidas por meio da Swiss Ephemeris.

Exemplos:

- Data
- Hora
- Fuso horário
- Coordenadas geográficas
- Longitude eclíptica
- Latitude eclíptica
- Declinação
- Ascensão reta
- Velocidade
- Cúspides das casas
- Ângulos astronômicos

### GEOMETRIC_DERIVED

Informações obtidas por operações geométricas sobre dados astronômicos.

Exemplo:

- Casa ocupada por um corpo

### ASTROLOGICAL_DERIVED

Informações resultantes de regras ou interpretações astrológicas.

Esta categoria não será produzida pelo Motor Astronômico.

---

## 3. Tipos de objetos

Os objetos astronômicos podem possuir os seguintes tipos:

| Tipo | Descrição |
|---|---|
| `PLANET` | Planeta ou luminar |
| `NODE` | Nodo ou ponto lunar |
| `ASTEROID` | Asteroide ou corpo menor |
| `FIXED_STAR` | Estrela fixa |
| `ANGLE` | Ângulo astronômico do mapa |
| `ECLIPSE_POINT` | Posição associada a um eclipse |

A Parte da Fortuna não pertence a esta API porque sua posição depende de uma fórmula astrológica.

---

## 4. CelestialObject

`CelestialObject` é a estrutura básica dos objetos retornados pela API.

### Atributos

| Atributo | Tipo | Classificação | Descrição |
|---|---|---|---|
| `id` | string | RAW_DATA | Identificador padronizado |
| `name` | string | RAW_DATA | Nome legível do objeto |
| `type` | string | RAW_DATA | Tipo do objeto |
| `longitude` | number ou null | RAW_DATA | Longitude eclíptica em graus |
| `ecliptic_latitude` | number ou null | RAW_DATA | Latitude eclíptica em graus |
| `declination` | number ou null | RAW_DATA | Declinação em graus |
| `right_ascension` | number ou null | RAW_DATA | Ascensão reta em graus |
| `longitude_speed` | number ou null | RAW_DATA | Velocidade diária em longitude |
| `house` | number ou null | GEOMETRIC_DERIVED | Casa ocupada pelo objeto |

### Regras

- Longitudes devem estar entre `0` e menos de `360` graus.
- A casa, quando calculada, deve estar entre `1` e `12`.
- Dados indisponíveis devem utilizar `null`.
- Os valores numéricos devem ser retornados sem símbolos de graus.
- A API não deve acrescentar significados ou interpretações.

---

## 5. Planet

Representa um planeta ou luminar.

Planet utiliza todos os atributos de `CelestialObject`.

### Objetos suportados

| ID | Nome |
|---|---|
| `SOL` | Sol |
| `LUA` | Lua |
| `MERCURIO` | Mercúrio |
| `VENUS` | Vênus |
| `MARTE` | Marte |
| `JUPITER` | Júpiter |
| `SATURNO` | Saturno |
| `URANO` | Urano |
| `NETUNO` | Netuno |
| `PLUTAO` | Plutão |

### Tipo

```text
PLANET
```

---

## 6. Node

Representa um nodo ou ponto relacionado à órbita lunar.

Node utiliza todos os atributos de `CelestialObject`.

### Objetos suportados

| ID | Nome |
|---|---|
| `NODO_NORTE` | Nodo Norte |
| `NODO_SUL` | Nodo Sul |
| `LILITH_MEDIA` | Lilith Média |

### Tipo

```text
NODE
```

### Observações

O Nodo Sul pode ser obtido como o ponto geometricamente oposto ao Nodo Norte.

Lilith Média representa o apogeu lunar médio disponibilizado pela Swiss Ephemeris.

Nenhuma interpretação desses pontos será realizada.

---

## 7. Asteroid

Representa um asteroide ou corpo menor.

Asteroid utiliza todos os atributos de `CelestialObject`.

### Objetos suportados

| ID | Nome |
|---|---|
| `QUIRON` | Quíron |
| `CERES` | Ceres |
| `PALLAS` | Pallas |
| `JUNO` | Juno |
| `VESTA` | Vesta |

### Tipo

```text
ASTEROID
```

---

## 8. FixedStar

Representa uma estrela fixa.

FixedStar utiliza todos os atributos de `CelestialObject`.

### Estrelas previstas

| ID | Nome |
|---|---|
| `ALDEBARAN` | Aldebaran |
| `ANTARES` | Antares |
| `REGULUS` | Regulus |
| `FOMALHAUT` | Fomalhaut |
| `SIRIUS` | Sirius |
| `SPICA` | Spica |
| `ALGOL` | Algol |

### Tipo

```text
FIXED_STAR
```

### Limite da primeira versão

A estrutura e a interface do adapter serão preparadas para estrelas fixas.

A ativação dos cálculos poderá ocorrer em uma versão posterior.

A API não calculará conjunções, aspectos ou orbes.

---

## 9. EclipsePoint

Representa a posição astronômica de um eclipse.

EclipsePoint utiliza todos os atributos de `CelestialObject`.

### Pontos previstos

| ID | Descrição |
|---|---|
| `ECLIPSE_SOL_PRE_NATAL` | Eclipse solar anterior ao instante informado |
| `ECLIPSE_LUA_PRE_NATAL` | Eclipse lunar anterior ao instante informado |
| `ECLIPSE_SOL_POS_NATAL` | Eclipse solar posterior ao instante informado |
| `ECLIPSE_LUA_POS_NATAL` | Eclipse lunar posterior ao instante informado |

### Tipo

```text
ECLIPSE_POINT
```

### Limite da primeira versão

A primeira versão definirá somente a estrutura desses objetos.

A pesquisa e o cálculo dos eclipses não serão implementados nesta etapa.

---

## 10. HouseCusp

Representa a cúspide de uma casa calculada pela Swiss Ephemeris.

### Atributos

| Atributo | Tipo | Classificação | Descrição |
|---|---|---|---|
| `house_number` | integer | RAW_DATA | Número da casa |
| `longitude` | number | RAW_DATA | Longitude eclíptica da cúspide |

### Regras

- Devem ser retornadas exatamente 12 cúspides.
- `house_number` deve estar entre `1` e `12`.
- `longitude` deve estar entre `0` e menos de `360`.
- O sistema de casas utilizado deve ser informado nos metadados.

---

## 11. ChartAngles

Agrupa os principais ângulos calculados pela Swiss Ephemeris.

### Atributos

| Atributo | Tipo | Classificação | Descrição |
|---|---|---|---|
| `asc` | number | RAW_DATA | Longitude do Ascendente |
| `mc` | number | RAW_DATA | Longitude do Meio do Céu |
| `vertex` | number | RAW_DATA | Longitude do Vertex |

### Regras

- Os valores devem ser expressos em graus.
- Os valores devem estar entre `0` e menos de `360`.
- A API deve retornar apenas os valores, sem interpretação.

---

## 12. ChartRequest

Representa o corpo JSON enviado pelo usuário para solicitar um cálculo.

### Atributos

| Atributo | Tipo | Obrigatório | Classificação | Descrição |
|---|---|---|---|---|
| `date` | string | Sim | RAW_DATA | Data civil no formato `AAAA-MM-DD` |
| `time` | string | Sim | RAW_DATA | Horário no formato `HH:MM:SS` |
| `timezone` | string | Sim | RAW_DATA | Fuso horário no padrão IANA |
| `latitude` | number | Sim | RAW_DATA | Latitude geográfica |
| `longitude` | number | Sim | RAW_DATA | Longitude geográfica |
| `house_system` | string | Não | RAW_DATA | Código do sistema de casas |

### Exemplo

```json
{
  "date": "2000-01-01",
  "time": "12:00:00",
  "timezone": "America/Sao_Paulo",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "house_system": "P"
}
```

### Validações

- `date` deve representar uma data válida.
- `time` deve representar um horário válido.
- `timezone` deve ser um fuso horário IANA válido.
- `latitude` deve estar entre `-90` e `90`.
- `longitude` geográfica deve estar entre `-180` e `180`.
- `house_system`, quando omitido, utilizará o padrão documentado pela API.

---

## 13. AstronomicalChart

Representa a resposta astronômica completa da API.

### Atributos

| Atributo | Tipo | Classificação | Descrição |
|---|---|---|---|
| `input` | ChartRequest | RAW_DATA | Entrada normalizada |
| `time` | TimeData | RAW_DATA | Informações temporais do cálculo |
| `objects` | CelestialObject[] | RAW_DATA e GEOMETRIC_DERIVED | Corpos calculados |
| `houses` | HouseCusp[] | RAW_DATA | Cúspides das casas |
| `angles` | ChartAngles | RAW_DATA | Ângulos calculados |
| `metadata` | Metadata | RAW_DATA | Informações técnicas |

---

## 14. TimeData

Contém os dados temporais normalizados antes da consulta à Swiss Ephemeris.

### Atributos

| Atributo | Tipo | Classificação | Descrição |
|---|---|---|---|
| `local_datetime` | string | RAW_DATA | Data e hora no fuso informado |
| `utc_datetime` | string | RAW_DATA | Data e hora convertidas para UTC |
| `julian_day` | number | RAW_DATA | Dia Juliano utilizado no cálculo |

---

## 15. Metadata

Contém informações técnicas sobre a geração da resposta.

### Atributos

| Atributo | Tipo | Classificação | Descrição |
|---|---|---|---|
| `service` | string | RAW_DATA | Nome do serviço |
| `service_version` | string | RAW_DATA | Versão da API |
| `astronomical_engine` | string | RAW_DATA | Motor astronômico utilizado |
| `house_system` | string | RAW_DATA | Sistema de casas utilizado |
| `generated_at` | string | RAW_DATA | Data e hora de geração |
| `warnings` | string[] | RAW_DATA | Avisos técnicos |

---

## 16. Relacionamentos

```text
ChartRequest
     |
     v
AstronomicalChart
     |
     +-- TimeData
     |
     +-- CelestialObject[]
     |     |
     |     +-- Planet
     |     +-- Node
     |     +-- Asteroid
     |     +-- FixedStar
     |     +-- EclipsePoint
     |
     +-- HouseCusp[12]
     |
     +-- ChartAngles
     |
     +-- Metadata
```

---

## 17. Exemplo de resposta

Os números deste exemplo são apenas ilustrativos.

```json
{
  "input": {
    "date": "2000-01-01",
    "time": "12:00:00",
    "timezone": "America/Sao_Paulo",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "house_system": "P"
  },
  "time": {
    "local_datetime": "2000-01-01T12:00:00-02:00",
    "utc_datetime": "2000-01-01T14:00:00.000Z",
    "julian_day": 2451545.083333
  },
  "objects": [
    {
      "id": "SOL",
      "name": "Sol",
      "type": "PLANET",
      "longitude": 280.5,
      "ecliptic_latitude": 0.0001,
      "declination": -23.0,
      "right_ascension": 281.2,
      "longitude_speed": 1.019,
      "house": 10
    }
  ],
  "houses": [
    {
      "house_number": 1,
      "longitude": 15.0
    }
  ],
  "angles": {
    "asc": 15.0,
    "mc": 280.0,
    "vertex": 190.0
  },
  "metadata": {
    "service": "Motor Astronômico",
    "service_version": "1.0.0",
    "astronomical_engine": "Swiss Ephemeris",
    "house_system": "P",
    "generated_at": "2026-06-11T12:00:00.000Z",
    "warnings": []
  }
}
```

---

## 18. Dados excluídos

O Motor Astronômico não produzirá:

- Aspectos astrológicos
- Orbes
- Dignidades
- Recepções
- Dispositores
- Almuten
- Sect
- Hayz ou Haym
- Lots astrológicos
- Sizígias interpretativas
- Profeções
- Firdaria
- Zodiacal Releasing
- Hyleg
- Alcocoden
- Kurios
- Oikodespotes
- Configurações planetárias
- Antíscia
- Dodecatemórias
- Interpretações
- Pontuações de força
- Relatórios astrológicos

---

## 19. Regra fundamental

O Motor Astronômico deve responder somente:

> Quais eram as posições astronômicas dos corpos, casas e ângulos no instante e local informados?

Qualquer interpretação ou método astrológico pertence a outro sistema e não faz parte deste repositório.
