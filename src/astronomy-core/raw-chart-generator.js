import { DateTime, IANAZone } from "luxon";

import {
  bodyIds,
  calculateBody,
  calculateHousePosition,
  calculateHouses,
  calculateJulianDay,
  calculateObliquity,
  getEphemerisVersion,
} from "./swiss-ephemeris-adapter.js";

const BODY_DEFINITIONS = Object.freeze([
  { id: "SOL", name: "Sol", type: "PLANET", required: true },
  { id: "LUA", name: "Lua", type: "PLANET", required: true },
  { id: "MERCURIO", name: "Mercurio", type: "PLANET", required: true },
  { id: "VENUS", name: "Venus", type: "PLANET", required: true },
  { id: "MARTE", name: "Marte", type: "PLANET", required: true },
  { id: "JUPITER", name: "Jupiter", type: "PLANET", required: true },
  { id: "SATURNO", name: "Saturno", type: "PLANET", required: true },
  { id: "URANO", name: "Urano", type: "PLANET", required: true },
  { id: "NETUNO", name: "Netuno", type: "PLANET", required: true },
  { id: "PLUTAO", name: "Plutao", type: "PLANET", required: true },
  { id: "NODO_NORTE", name: "Nodo Norte", type: "NODE", required: true },
  { id: "LILITH_MEDIA", name: "Lilith Media", type: "NODE", required: true },
  { id: "QUIRON", name: "Quiron", type: "ASTEROID", required: false },
  { id: "CERES", name: "Ceres", type: "ASTEROID", required: false },
  { id: "PALLAS", name: "Pallas", type: "ASTEROID", required: false },
  { id: "JUNO", name: "Juno", type: "ASTEROID", required: false },
  { id: "VESTA", name: "Vesta", type: "ASTEROID", required: false },
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

function validateInput(input) {
  const errors = [];

  if (!input || typeof input !== "object" || Array.isArray(input)) {
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
    errors.push("timezone deve ser um fuso horario IANA valido.");
  }

  if (
    typeof input.latitude !== "number" ||
    !Number.isFinite(input.latitude) ||
    input.latitude < -90 ||
    input.latitude > 90
  ) {
    errors.push("latitude deve ser um numero entre -90 e 90.");
  }

  if (
    typeof input.longitude !== "number" ||
    !Number.isFinite(input.longitude) ||
    input.longitude < -180 ||
    input.longitude > 180
  ) {
    errors.push("longitude deve ser um numero entre -180 e 180.");
  }

  const houseSystem = input.houseSystem ?? "P";

  if (
    typeof houseSystem !== "string" ||
    !/^[A-Za-z]$/.test(houseSystem)
  ) {
    errors.push("houseSystem deve conter uma unica letra.");
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
      [localDateTime.invalidExplanation ?? "Data e hora invalidas."],
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

function createSouthNode(northNode) {
  return {
    ...northNode,
    id: "NODO_SUL",
    name: "Nodo Sul",
    longitude: normalizeDegrees(northNode.longitude + 180),
    latitudeEcliptica: -northNode.latitudeEcliptica,
    declination: -northNode.declination,
    rightAscension: normalizeDegrees(
      northNode.rightAscension + 180,
    ),
    speedLatitude: -northNode.speedLatitude,
    house: null,
  };
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

  const house = calculateHousePosition({
    armc: housesData.armc,
    latitude,
    obliquity,
    houseSystem,
    longitude: astronomicalData.longitude,
    latitudeEcliptica: astronomicalData.latitudeEcliptica,
  });

  return {
    id: definition.id,
    name: definition.name,
    type: definition.type,
    ...astronomicalData,
    house,
  };
}

export function generateRawChart(input) {
  const normalized = validateInput(input);
  const utcDateTime = normalized.localDateTime.toUTC();

  const utcHour =
    utcDateTime.hour +
    utcDateTime.minute / 60 +
    utcDateTime.second / 3600 +
    utcDateTime.millisecond / 3600000;

  const julianDay = calculateJulianDay({
    year: utcDateTime.year,
    month: utcDateTime.month,
    day: utcDateTime.day,
    utcHour,
  });

  const obliquity = calculateObliquity(julianDay);

  const housesData = calculateHouses({
    julianDay,
    latitude: normalized.latitude,
    longitude: normalized.longitude,
    houseSystem: normalized.houseSystem,
  });

  const objects = [];
  const warnings = [];

  for (const definition of BODY_DEFINITIONS) {
    try {
      objects.push(
        calculateObject({
          definition,
          julianDay,
          housesData,
          obliquity,
          latitude: normalized.latitude,
          houseSystem: normalized.houseSystem,
        }),
      );
    } catch (error) {
      if (definition.required) {
        throw error;
      }

      warnings.push(
        `${definition.id} nao foi calculado: ${error.message}`,
      );
    }
  }

  const northNode = objects.find(
    (object) => object.id === "NODO_NORTE",
  );

  if (northNode) {
    const southNode = createSouthNode(northNode);

    southNode.house = calculateHousePosition({
      armc: housesData.armc,
      latitude: normalized.latitude,
      obliquity,
      houseSystem: normalized.houseSystem,
      longitude: southNode.longitude,
      latitudeEcliptica: southNode.latitudeEcliptica,
    });

    const northNodeIndex = objects.findIndex(
      (object) => object.id === "NODO_NORTE",
    );

    objects.splice(northNodeIndex + 1, 0, southNode);
  }

  return {
    input: {
      date: normalized.date,
      time: normalized.time,
      timezone: normalized.timezone,
      latitude: normalized.latitude,
      longitude: normalized.longitude,
      houseSystem: normalized.houseSystem,
    },
    time: {
      localDateTime: normalized.localDateTime.toISO(),
      utcDateTime: utcDateTime.toISO(),
      julianDay,
    },
    chartData: {
      julianDay,
      obliquity,
      latitude: normalized.latitude,
      longitude: normalized.longitude,
      timezone: normalized.timezone,
    },
    objects,
    houses: housesData.houses,
    angles: housesData.angles,
    metadata: {
      service: "Motor Astronomico",
      serviceVersion: "1.0.0",
      astronomicalEngine: "Swiss Ephemeris",
      ephemerisVersion: getEphemerisVersion(),
      houseSystem: normalized.houseSystem,
      coordinateReference: "GEOCENTRIC_TROPICAL_APPARENT",
      generatedAt: new Date().toISOString(),
      warnings,
    },
  };
}
