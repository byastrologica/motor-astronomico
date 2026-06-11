import { DateTime, IANAZone } from "luxon";

import {
  bodyIds,
  calculateBody,
  calculateFixedStar,
  calculateHousePosition,
  calculateHouses,
  calculateJulianDay,
  calculateObliquity,
  getEphemerisVersion,
} from "./swiss-ephemeris-adapter.js";

const BODY_DEFINITIONS = Object.freeze([
  {
    id: "SOL",
    name: "Sol",
    type: "PLANET",
    required: true,
  },
  {
    id: "LUA",
    name: "Lua",
    type: "PLANET",
    required: true,
  },
  {
    id: "MERCURIO",
    name: "Mercurio",
    type: "PLANET",
    required: true,
  },
  {
    id: "VENUS",
    name: "Venus",
    type: "PLANET",
    required: true,
  },
  {
    id: "MARTE",
    name: "Marte",
    type: "PLANET",
    required: true,
  },
  {
    id: "JUPITER",
    name: "Jupiter",
    type: "PLANET",
    required: true,
  },
  {
    id: "SATURNO",
    name: "Saturno",
    type: "PLANET",
    required: true,
  },
  {
    id: "URANO",
    name: "Urano",
    type: "PLANET",
    required: true,
  },
  {
    id: "NETUNO",
    name: "Netuno",
    type: "PLANET",
    required: true,
  },
  {
    id: "PLUTAO",
    name: "Plutao",
    type: "PLANET",
    required: true,
  },
  {
    id: "NODO_NORTE_MEDIO",
    name: "Nodo Norte Medio",
    type: "NODE",
    required: true,
  },
  {
    id: "NODO_NORTE_VERDADEIRO",
    name: "Nodo Norte Verdadeiro",
    type: "NODE",
    required: true,
  },
  {
    id: "LILITH_MEDIA",
    name: "Lilith Media",
    type: "NODE",
    required: true,
  },
  {
    id: "QUIRON",
    name: "Quiron",
    type: "ASTEROID",
    required: false,
  },
  {
    id: "CERES",
    name: "Ceres",
    type: "ASTEROID",
    required: false,
  },
  {
    id: "PALLAS",
    name: "Pallas",
    type: "ASTEROID",
    required: false,
  },
  {
    id: "JUNO",
    name: "Juno",
    type: "ASTEROID",
    required: false,
  },
  {
    id: "VESTA",
    name: "Vesta",
    type: "ASTEROID",
    required: false,
  },
]);

const FIXED_STAR_DEFINITIONS = Object.freeze([
  {
    id: "ALDEBARAN",
    name: "Aldebaran",
    catalogName: "Aldebaran",
  },
  {
    id: "ANTARES",
    name: "Antares",
    catalogName: "Antares",
  },
  {
    id: "REGULUS",
    name: "Regulus",
    catalogName: "Regulus",
  },
  {
    id: "FOMALHAUT",
    name: "Fomalhaut",
    catalogName: "Fomalhaut",
  },
  {
    id: "SIRIUS",
    name: "Sirius",
    catalogName: "Sirius",
  },
  {
    id: "SPICA",
    name: "Spica",
    catalogName: "Spica",
  },
  {
    id: "ALGOL",
    name: "Algol",
    catalogName: "Algol",
  },
]);

const NODE_PAIRS = Object.freeze([
  {
    northId: "NODO_NORTE_MEDIO",
    southId: "NODO_SUL_MEDIO",
    southName: "Nodo Sul Medio",
  },
  {
    northId: "NODO_NORTE_VERDADEIRO",
    southId: "NODO_SUL_VERDADEIRO",
    southName: "Nodo Sul Verdadeiro",
  },
]);

export class ValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function calculateZodiacalHouse(longitude, houses) {
  const normalizedLongitude = normalizeDegrees(longitude);

  for (let index = 0; index < houses.length; index += 1) {
    const current = houses[index];
    const next = houses[(index + 1) % houses.length];

    const houseArc = normalizeDegrees(
      next.longitude - current.longitude,
    );

    const objectArc = normalizeDegrees(
      normalizedLongitude - current.longitude,
    );

    if (objectArc < houseArc) {
      return current.house;
    }
  }

  return null;
}

function validateInput(input) {
  const errors = [];

  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    throw new ValidationError(
      "O corpo da requisicao deve ser um objeto JSON.",
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date ?? "")) {
    errors.push("date deve usar o formato AAAA-MM-DD.");
  }

  if (!/^\d{2}:\d{2}:\d{2}$/.test(input.time ?? "")) {
    errors.push("time deve usar o formato HH:MM:SS.");
  }

  if (
    typeof input.timezone !== "string" ||
    !IANAZone.isValidZone(input.timezone)
  ) {
    errors.push(
      "timezone deve ser um fuso horario IANA valido.",
    );
  }

  if (
    typeof input.latitude !== "number" ||
    !Number.isFinite(input.latitude) ||
    input.latitude < -90 ||
    input.latitude > 90
  ) {
    errors.push(
      "latitude deve ser um numero entre -90 e 90.",
    );
  }

  if (
    typeof input.longitude !== "number" ||
    !Number.isFinite(input.longitude) ||
    input.longitude < -180 ||
    input.longitude > 180
  ) {
    errors.push(
      "longitude deve ser um numero entre -180 e 180.",
    );
  }

  const houseSystem = input.houseSystem ?? "P";

  if (
    typeof houseSystem !== "string" ||
    !/^[A-Za-z]$/.test(houseSystem)
  ) {
    errors.push(
      "houseSystem deve conter uma unica letra.",
    );
  }

  if (errors.length > 0) {
    throw new ValidationError(
      "Dados de entrada invalidos.",
      errors,
    );
  }

  const localDateTime = DateTime.fromISO(
    `${input.date}T${input.time}`,
    {
      zone: input.timezone,
      setZone: true,
    },
  );

  if (!localDateTime.isValid) {
    throw new ValidationError(
      "A data, hora ou combinacao com o fuso horario e invalida.",
      [
        localDateTime.invalidExplanation ??
          "Data e hora invalidas.",
      ],
    );
  }

  return {
    date: input.date,
    time: input.time,
    timezone: input.timezone,
    latitude: input.latitude,
    longitude: input.longitude,
    houseSystem: houseSystem.toUpperCase(),
    localDateTime,
  };
}

function locateMundaneHouse({
  astronomicalData,
  housesData,
  obliquity,
  latitude,
  houseSystem,
}) {
  return calculateHousePosition({
    armc: housesData.armc,
    latitude,
    obliquity,
    houseSystem,
    longitude: astronomicalData.longitude,
    latitudeEcliptica:
      astronomicalData.latitudeEcliptica,
  });
}

function calculateObject({
  definition,
  julianDay,
  housesData,
  obliquity,
  latitude,
  houseSystem,
}) {
  const astronomicalData = calculateBody(
    julianDay,
    bodyIds[definition.id],
  );

  return {
    id: definition.id,
    name: definition.name,
    type: definition.type,
    ...astronomicalData,
    house: calculateZodiacalHouse(
      astronomicalData.longitude,
      housesData.houses,
    ),
    mundaneHousePosition: locateMundaneHouse({
      astronomicalData,
      housesData,
      obliquity,
      latitude,
      houseSystem,
    }),
  };
}

function calculateStar({
  definition,
  julianDay,
 
