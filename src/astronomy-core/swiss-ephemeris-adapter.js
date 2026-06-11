import {
  calc_ut,
  house_pos,
  houses_ex2,
  julday,
  version,
  constants,
} from "sweph";

const DEFAULT_FLAGS =
  constants.SEFLG_SWIEPH |
  constants.SEFLG_SPEED;

const EQUATORIAL_FLAGS =
  DEFAULT_FLAGS |
  constants.SEFLG_EQUATORIAL;

function validateResult(result, operation) {
  if (!result || result.flag === constants.ERR) {
    throw new Error(
      result?.error || `Falha da Swiss Ephemeris em ${operation}.`,
    );
  }

  return result;
}

export function calculateJulianDay({
  year,
  month,
  day,
  utcHour,
}) {
  return julday(
    year,
    month,
    day,
    utcHour,
    constants.SE_GREG_CAL,
  );
}

export function calculateBody(julianDay, bodyId) {
  const ecliptic = validateResult(
    calc_ut(julianDay, bodyId, DEFAULT_FLAGS),
    "calculateBody/ecliptic",
  );

  const equatorial = validateResult(
    calc_ut(julianDay, bodyId, EQUATORIAL_FLAGS),
    "calculateBody/equatorial",
  );

  return {
    longitude: ecliptic.data[0],
    latitudeEcliptica: ecliptic.data[1],
    distanceAU: ecliptic.data[2],
    speedLongitude: ecliptic.data[3],
    speedLatitude: ecliptic.data[4],
    speedRadial: ecliptic.data[5],
    rightAscension: equatorial.data[0],
    declination: equatorial.data[1],
  };
}

export function calculateObliquity(julianDay) {
  const result = validateResult(
    calc_ut(
      julianDay,
      constants.SE_ECL_NUT,
      constants.SEFLG_SWIEPH,
    ),
    "calculateObliquity",
  );

  return result.data[0];
}

export function calculateHouses({
  julianDay,
  latitude,
  longitude,
  houseSystem = "P",
}) {
  const result = validateResult(
    houses_ex2(
      julianDay,
      0,
      latitude,
      longitude,
      houseSystem,
    ),
    "calculateHouses",
  );

  return {
    houses: result.data.houses.map((cuspLongitude, index) => ({
      house: index + 1,
      longitude: cuspLongitude,
    })),
    angles: {
      asc: result.data.points[constants.SE_ASC],
      mc: result.data.points[constants.SE_MC],
      vertex: result.data.points[constants.SE_VERTEX],
    },
    armc: result.data.points[constants.SE_ARMC],
  };
}

export function calculateHousePosition({
  armc,
  latitude,
  obliquity,
  houseSystem = "P",
  longitude,
  latitudeEcliptica,
}) {
  const result = house_pos(
    armc,
    latitude,
    obliquity,
    houseSystem,
    [longitude, latitudeEcliptica],
  );

  if (!result || result.error) {
    throw new Error(
      result?.error ||
        "Falha ao determinar a casa ocupada pelo corpo.",
    );
  }

  const house = Math.floor(result.data);

  return house >= 1 && house <= 12 ? house : null;
}

export function getEphemerisVersion() {
  return version();
}

export const bodyIds = Object.freeze({
  SOL: constants.SE_SUN,
  LUA: constants.SE_MOON,
  MERCURIO: constants.SE_MERCURY,
  VENUS: constants.SE_VENUS,
  MARTE: constants.SE_MARS,
  JUPITER: constants.SE_JUPITER,
  SATURNO: constants.SE_SATURN,
  URANO: constants.SE_URANUS,
  NETUNO: constants.SE_NEPTUNE,
  PLUTAO: constants.SE_PLUTO,
  NODO_NORTE: constants.SE_MEAN_NODE,
  LILITH_MEDIA: constants.SE_MEAN_APOG,
  QUIRON: constants.SE_CHIRON,
  CERES: constants.SE_CERES,
  PALLAS: constants.SE_PALLAS,
  JUNO: constants.SE_JUNO,
  VESTA: constants.SE_VESTA,
});
