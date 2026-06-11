Você tem razão, faltou o conteúdo. Crie o arquivo `docs/domain-model.md` e cole **tudo abaixo**:

```markdown
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
```

---

## 6. Node

Representa um nodo lunar.

Node herda todos os atributos de `CelestialObject`.

### Objetos suportados

- `NODO_NORTE`
- `NODO_SUL`

### Atributos próprios

Node não possui atributos adicionais nesta tarefa.

### Tipo obrigatório

```text
NODE
```

### Observação

O Nodo Sul pode ser obtido geometricamente como o ponto oposto ao Nodo Norte.

Essa derivação deve ser tratada posteriormente pela implementação, sem introduzir interpretação astrológica.

---

## 7. Asteroid

Representa um asteroide ou corpo menor.

Asteroid herda todos os atributos de `CelestialObject`.

### Objetos suportados

- `QUIRON`
- `CERES`
- `PALLAS`
- `JUNO`
- `VESTA`

### Atributos próprios

Asteroid não possui atributos adicionais nesta tarefa.

### Tipo obrigatório

```text
ASTEROID
```

---

## 8. Lot

Representa uma parte ou lot astrológico.

Lot herda todos os atributos de `CelestialObject`.

### Objetos inicialmente previstos

- `PARTE_DA_FORTUNA`

### Tipo obrigatório

```text
LOT
```

### Classificação especial

A posição de um lot é classificada como `ASTROLOGICAL_DERIVED`, pois depende de uma fórmula astrológica.

| Atributo | Classificação |
|---|---|
| `longitude` | ASTROLOGICAL_DERIVED |
| `latitude` | ASTROLOGICAL_DERIVED |
| `declination` | ASTROLOGICAL_DERIVED |
| `right_ascension` | ASTROLOGICAL_DERIVED |
| `speed` | ASTROLOGICAL_DERIVED |
| `house` | ASTROLOGICAL_DERIVED |

### Regra desta tarefa

A estrutura de `Lot` será definida, mas a Parte da Fortuna não será calculada nesta tarefa.

Os campos astronômicos permanecerão com valor `null`.

---

## 9. FixedStar

Representa uma estrela fixa.

FixedStar herda todos os atributos de `CelestialObject`.

### Estrelas suportadas

- `ALDEBARAN`
- `ANTARES`
- `REGULUS`
- `FOMALHAUT`
- `SIRIUS`
- `SPICA`
- `ALGOL`

### Tipo obrigatório

```text
FIXED_STAR
```

### Regra desta tarefa

O adapter da Swiss Ephemeris deve possuir uma interface preparada para cálculos de estrelas fixas.

A inclusão das estrelas no resultado completo será realizada quando o suporte for ativado.

Nenhuma regra de conjunção ou orbe será implementada nesta tarefa.

---

## 10. Angle

Representa um ângulo calculado para o mapa.

Angle herda a estrutura básica de `CelestialObject`.

### Ângulos previstos

- `ASC`
- `MC`
- `VERTEX`

### Tipo obrigatório

```text
ANGLE
```

### Classificação especial

| Atributo | Classificação |
|---|---|
| `longitude` | RAW_DATA |
| `latitude` | RAW_DATA |
| `declination` | RAW_DATA |
| `right_ascension` | RAW_DATA |
| `speed` | RAW_DATA |
| `house` | GEOMETRIC_DERIVED |

Os ângulos são resultados astronômicos calculados pela Swiss Ephemeris a partir do momento e da localização do mapa.

Campos que não forem fornecidos pelo cálculo devem permanecer como `null`.

---

## 11. EclipsePoint

Representa um ponto de eclipse relacionado ao nascimento.

EclipsePoint herda todos os atributos de `CelestialObject`.

### Pontos previstos

- `ECLIPSE_SOL_PRE_NATAL`
- `ECLIPSE_LUA_PRE_NATAL`
- `ECLIPSE_SOL_POS_NATAL`
- `ECLIPSE_LUA_POS_NATAL`

### Tipo obrigatório

```text
ECLIPSE_POINT
```

### Regra desta tarefa

Nesta tarefa, somente a estrutura será definida.

Os eclipses não serão pesquisados nem calculados.

Seus campos astronômicos devem permanecer com valor `null`.

---

## 12. Lilith Média

`LILITH_MEDIA` representa o apogeu lunar médio utilizado pela Swiss Ephemeris.

Para manter a lista oficial de tipos da especificação, ela será modelada como um objeto do tipo `NODE`.

### Identificação

| Atributo | Valor |
|---|---|
| `id` | `LILITH_MEDIA` |
| `name` | `Lilith Média` |
| `type` | `NODE` |

Sua posição astronômica pode ser obtida pela Swiss Ephemeris sem aplicação de interpretação astrológica.

---

## 13. HouseCusp

Representa a cúspide de uma casa.

HouseCusp não herda de `CelestialObject`, pois é uma divisão espacial do mapa e não um corpo celeste.

### Atributos

| Atributo | Tipo | Classificação | Descrição |
|---|---|---|---|
| `house_number` | integer | RAW_DATA | Número da casa, entre 1 e 12 |
| `longitude` | number | RAW_DATA | Longitude eclíptica da cúspide |

### Regras

- Devem existir exatamente 12 cúspides.
- `house_number` deve estar entre `1` e `12`.
- `longitude` deve estar entre `0` e menos de `360` graus.
- As cúspides são calculadas pela Swiss Ephemeris.
- O sistema de casas deve ser informado explicitamente ou usar o padrão documentado pelo projeto.

---

## 14. ChartAngles

Agrupa os principais ângulos calculados para o mapa.

### Atributos

| Atributo | Tipo | Classificação | Descrição |
|---|---|---|---|
| `asc` | number | RAW_DATA | Longitude do Ascendente |
| `mc` | number | RAW_DATA | Longitude do Meio do Céu |
| `vertex` | number | RAW_DATA | Longitude do Vertex |

### Regras

- Todos os valores devem ser expressos em graus.
- Todos os valores devem estar entre `0` e menos de `360`.
- Os valores devem ser calculados pela Swiss Ephemeris.
- Nenhuma interpretação astrológica deve ser adicionada.

---

## 15. NatalChart

Representa o resultado completo da geração de um mapa natal bruto.

NatalChart funciona como o objeto principal de resposta do Astronomy Core.

### Atributos de entrada

| Atributo | Tipo | Classificação | Descrição |
|---|---|---|---|
| `date` | string | RAW_DATA | Data civil informada pelo usuário |
| `time` | string | RAW_DATA | Horário civil informado pelo usuário |
| `timezone` | string | RAW_DATA | Fuso horário IANA informado pelo usuário |
| `latitude` | number | RAW_DATA | Latitude geográfica |
| `longitude` | number | RAW_DATA | Longitude geográfica |
| `house_system` | string | RAW_DATA | Sistema de casas utilizado |

### Atributos temporais normalizados

| Atributo | Tipo | Classificação | Descrição |
|---|---|---|---|
| `local_datetime` | string | RAW_DATA | Data e hora local normalizadas |
| `utc_datetime` | string | RAW_DATA | Data e hora convertidas para UTC |
| `julian_day` | number | RAW_DATA | Dia Juliano utilizado pela Swiss Ephemeris |

### Coleções e resultados

| Atributo | Tipo | Classificação | Descrição |
|---|---|---|---|
| `objects` | CelestialObject[] | RAW_DATA | Corpos e pontos calculados |
| `houses` | HouseCusp[] | RAW_DATA | Doze cúspides das casas |
| `angles` | ChartAngles | RAW_DATA | Ascendente, MC e Vertex |
| `metadata` | object | RAW_DATA | Informações técnicas do cálculo |

### Metadados previstos

| Atributo | Tipo | Classificação | Descrição |
|---|---|---|---|
| `engine` | string | RAW_DATA | Nome do motor astronômico |
| `ephemeris` | string | RAW_DATA | Fonte das efemérides |
| `house_system` | string | RAW_DATA | Sistema de casas aplicado |
| `generated_at` | string | RAW_DATA | Momento de geração da resposta |
| `warnings` | string[] | RAW_DATA | Avisos técnicos não interpretativos |

---

## 16. Relacionamentos

```text
NatalChart
 ├── contém vários CelestialObject
 │    ├── Planet
 │    ├── Node
 │    ├── Asteroid
 │    ├── Lot
 │    ├── FixedStar
 │    ├── Angle
 │    └── EclipsePoint
 │
 ├── contém 12 HouseCusp
 │
 └── contém 1 ChartAngles
```

### Cardinalidades

| Origem | Relacionamento | Destino |
|---|---|---|
| `NatalChart` | contém zero ou vários | `CelestialObject` |
| `NatalChart` | contém exatamente doze | `HouseCusp` |
| `NatalChart` | contém exatamente um | `ChartAngles` |
| `Planet` | herda de | `CelestialObject` |
| `Node` | herda de | `CelestialObject` |
| `Asteroid` | herda de | `CelestialObject` |
| `Lot` | herda de | `CelestialObject` |
| `FixedStar` | herda de | `CelestialObject` |
| `Angle` | herda de | `CelestialObject` |
| `EclipsePoint` | herda de | `CelestialObject` |

---

## 17. Exemplo conceitual de NatalChart

Este exemplo demonstra apenas a estrutura do domínio.

```json
{
  "date": "2000-01-01",
  "time": "12:00:00",
  "timezone": "America/Sao_Paulo",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "house_system": "P",
  "local_datetime": "2000-01-01T12:00:00-02:00",
  "utc_datetime": "2000-01-01T14:00:00.000Z",
  "julian_day": 2451545.083333,
  "objects": [
    {
      "id": "SOL",
      "name": "Sol",
      "type": "PLANET",
      "longitude": 280.5,
      "latitude": 0.0001,
      "declination": -23.0,
      "right_ascension": 281.2,
      "speed": 1.019,
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
    "engine": "Astrologica Engine",
    "ephemeris": "Swiss Ephemeris",
    "house_system": "P",
    "generated_at": "2026-06-11T12:00:00.000Z",
    "warnings": []
  }
}
```

Os números desse exemplo são apenas ilustrativos e não devem ser utilizados como resultado astronômico real.

---

## 18. Limites desta tarefa

Nesta tarefa, o modelo não deve calcular:

- Aspectos.
- Orbes.
- Dignidades.
- Recepção.
- Dispositores.
- Almuten.
- Sect.
- Hayz.
- Haym.
- Lots derivados.
- Sizígias.
- Profeções.
- Firdaria.
- Zodiacal Releasing.
- Hyleg.
- Alcocoden.
- Kurios.
- Oikodespotes.
- Configurações planetárias.
- Antíscia.
- Dodecatemórias.
- Eclipses pré-natais ou pós-natais.

Essas funcionalidades pertencem a camadas futuras e não podem ser introduzidas no Astronomy Core.

---

## 19. Regra fundamental

A camada Astronomy Core deve responder somente à seguinte pergunta:

> Onde estavam astronomicamente os corpos, as casas e os ângulos no momento e local informados?

Ela não deve responder o que essas posições significam astrologicamente.
