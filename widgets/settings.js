'use strict';

export const WIDGET_SIGNALS = Object.freeze({
    locationChanged: 'location-changed',
    locationNameChanged: 'location-name-changed',
    weatherUpdated: 'weather-updated',
    forecastUpdated: 'forecast-updated',
});

export const EFFECT_NAMES = Object.freeze({
    blur: 'blur',
    blurClass: 'blur-my-shell',
    reflectionClass: 'glass-reflection-enabled',
    mirrorClass: 'glass-reflection-style-1',
});

export const WIDGET_KEYS = Object.freeze({
    clock: 'show-clock',
    stats: 'show-stats',
    clockWeather: 'show-weather',
    hourly: 'show-hourly-weather',
    weekly: 'show-weekly-weather',
    calendar: 'show-calendar',
    worldclock: 'show-world-clock',
});

export const CLOCK_KEYS = Object.freeze({
    styleOverride: 'clock-style-override-enabled',
    format24h: 'clock-format-24h',
    fontWeight: 'clock-font-weight',
    hourMinuteSizeRatio: 'clock-hour-minute-size-ratio',
    color: 'clock-color',
});

export const EFFECT_KEYS = Object.freeze({
    opacity: 'widget-opacity',
    blurEnabled: 'blur-enabled',
    reflectionEnabled: 'reflection-enabled',
    reflectionStyle: 'reflection-style',
});

export const POSITION_CONFIG = Object.freeze({
    migratedKey: 'position-values-migrated',
    minimumPercent: 0,
    maximumPercent: 100,
    decimalPlaces: 2,
    stepPercent: 0.5,
    pageStepPercent: 10,
    centerAnchor: 0.5,
});

export const LEGACY_POSITION_KEYS = Object.freeze({
    clock: Object.freeze({x: 'clock-x', y: 'clock-y'}),
    stats: Object.freeze({x: 'stats-x', y: 'stats-y'}),
    calendar: Object.freeze({x: 'calendar-x', y: 'calendar-y'}),
    worldclock: Object.freeze({x: 'world-clock-x', y: 'world-clock-y'}),
    hourly: Object.freeze({x: 'hourly-x', y: 'hourly-y'}),
    weekly: Object.freeze({x: 'weekly-x', y: 'weekly-y'}),
});

export const CLOCK_STYLE = Object.freeze({
    minimumHourRatio: 0.5,
    maximumHourRatio: 1.5,
    equalHourRatio: 1,
    ratioTolerance: 0.01,
    ratioDecimalPlaces: 1,
    ratioStep: 0.1,
    ratioPageStep: 0.5,
    minimumFontWeight: 100,
    maximumFontWeight: 900,
    fontWeightStep: 100,
    fontWeightPageStep: 200,
    baseFontSizePt: 40,
    defaultColor: '#ffffff',
});

export const CLOCK_REFRESH_INTERVAL_SECONDS = 1;

export const COLOR_FORMAT = Object.freeze({
    channelMaximum: 255,
    hexRadix: 16,
    hexChannelLength: 2,
});

export const OPACITY_CONFIG = Object.freeze({
    minimum: 0.1,
    maximum: 1,
    step: 0.05,
    pageStep: 0.1,
    decimalPlaces: 2,
});

export const BLUR_CONFIG = Object.freeze({brightness: 0.6, radius: 30});
export const REFLECTION_STYLE = Object.freeze({SHEEN: 0, MIRROR: 1});
export const SPONSOR_LAYOUT = Object.freeze({spacing: 16, margin: 12, qrSize: 240});

export const WEATHER_KEYS = Object.freeze({
    autoLocation: 'weather-auto-location',
    nameProvider: 'weather-location-name-provider',
    latitude: 'weather-lat',
    longitude: 'weather-lon',
    temperatureUnit: 'weather-temperature-unit',
});

export const LOCATION_NAME_PROVIDER = Object.freeze({
    LOCAL: 0,
    NOMINATIM: 1,
    PHOTON: 2,
});

export const TEMPERATURE_UNIT = Object.freeze({
    CELSIUS: 0,
    FAHRENHEIT: 1,
});

export const WEATHER_CONFIG = Object.freeze({
    updateIntervalMinutes: 30,
    coordinateDecimalPlaces: 4,
    latitudeLimit: 90,
    longitudeLimit: 180,
    coordinateStep: 0.01,
    coordinatePageStep: 1,
});

export const FAHRENHEIT_CONVERSION = Object.freeze({
    numerator: 9,
    denominator: 5,
    offset: 32,
});

export const WORLD_CLOCK_KEYS = Object.freeze({
    entries: 'world-clock-entries',
    showTicks: 'world-clock-show-ticks',
    showSeconds: 'world-clock-show-seconds',
    showNumbers: 'world-clock-show-numbers',
    showRelativeTime: 'world-clock-show-relative-time',
});