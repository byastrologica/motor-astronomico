# Motor Astronômico

API pública em Node.js para geração de dados astronômicos brutos utilizando a Swiss Ephemeris.

## Objetivo

O Motor Astronômico recebe data, hora, fuso horário e coordenadas geográficas e devolve dados astronômicos estruturados em JSON.

Este projeto é responsável exclusivamente por cálculos astronômicos.

## Dados fornecidos

A API poderá fornecer:

- Longitude eclíptica
- Latitude eclíptica
- Declinação
- Ascensão reta
- Velocidade dos corpos
- Cúspides das casas
- Ascendente
- Meio do Céu
- Vertex

## Objetos previstos

### Planetas e luminares

- Sol
- Lua
- Mercúrio
- Vênus
- Marte
- Júpiter
- Saturno
- Urano
- Netuno
- Plutão

### Outros corpos

- Nodo Norte
- Nodo Sul
- Lilith Média
- Quíron
- Ceres
- Pallas
- Juno
- Vesta

### Estrelas fixas

A estrutura será preparada para suporte posterior a estrelas fixas.

## Limites do projeto

Este repositório não contém:

- Interpretações astrológicas
- Aspectos astrológicos
- Orbes
- Dignidades
- Recepções
- Dispositores
- Métodos de avaliação
- Relatórios interpretativos
- Regras proprietárias

Essas funcionalidades não fazem parte desta API pública.

## Fluxo

```text
Entrada
  |
  v
Motor Astronômico
  |
  v
Swiss Ephemeris
  |
  v
Resposta JSON com dados astronômicos
