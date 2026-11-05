'use strict';

import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import GWeather from 'gi://GWeather';
import {APP_ID, PROJECT_URL} from './metadata.js';
import {GlassLocation} from './location.js';
import {FAHRENHEIT_CONVERSION, TEMPERATURE_UNIT, WEATHER_CONFIG, WEATHER_KEYS, WIDGET_SIGNALS} from './settings.js';

const TEMP_UNIT_KEY = WEATHER_KEYS.temperatureUnit;
const TEMP_UNIT_CELSIUS = TEMPERATURE_UNIT.CELSIUS;
const TEMP_UNIT_FAHRENHEIT = TEMPERATURE_UNIT.FAHRENHEIT;
const UPDATE_INTERVAL_SECONDS = WEATHER_CONFIG.updateIntervalMinutes * GLib.TIME_SPAN_MINUTE / GLib.TIME_SPAN_SECOND;

export const GlassWeather = GObject.registerClass({
    Signals: {[WIDGET_SIGNALS.weatherUpdated]: {}},
}, class GlassWeather extends GObject.Object {
    _init(settings, locationHelper = null) {
        super._init();

        this._settings = settings;
        this._location = null;
        this._info = null;
        this._timerId = null;
        this._iconName = null;
        this._temperature = null;

        this._info = new GWeather.Info({
            application_id: APP_ID,
            contact_info: PROJECT_URL,
            enabled_providers: GWeather.Provider.METAR |
                GWeather.Provider.MET_NO |
                GWeather.Provider.OWM,
        });
        this._infoUpdatedId = this._info.connect('updated', () => this._onInfoUpdated());

        this._settingsChangedIds = [];
        this._settingsChangedIds.push(settings.connect(
            `changed::${TEMP_UNIT_KEY}`, () => this._onTempUnitChanged()));
        this._locationHelper = locationHelper ?? new GlassLocation(settings);
        this._ownsLocationHelper = locationHelper === null;
        this._locationChangedId = this._locationHelper.connect(
            WIDGET_SIGNALS.locationChanged, (_, loc) => this._setLocation(loc));
        this._locationNameChangedId = this._locationHelper.connect(
            WIDGET_SIGNALS.locationNameChanged, () => this.emit(WIDGET_SIGNALS.weatherUpdated));
        if (this._locationHelper.location)
            this._setLocation(this._locationHelper.location);

        this._startTimer();
    }

    get iconName() {
        return this._iconName;
    }

    get temperature() {
        return this._temperature;
    }

    get hasWeather() {
        return this._iconName != null && this._temperature != null;
    }

    get locationName() {
        if (!this._location)
            return null;
        return this._locationHelper.locationName ?? this._info.get_location_name();
    }

    _setLocation(location) {
        if (this._location && location && this._location.equal(location))
            return;

        this._location = location;
        if (!location) {
            this._clearWeather();
            this.emit(WIDGET_SIGNALS.weatherUpdated);
            return;
        }

        this._info.abort();
        this._info.set_location(location);
        this._info.update();
    }

    _onInfoUpdated() {
        if (!this._info)
            return;

        if (this._info.is_valid()) {
            this._iconName = this._info.get_icon_name();
            this._temperature = this._formatTemperature();
        } else {
            this._clearWeather();
        }
        this.emit(WIDGET_SIGNALS.weatherUpdated);
    }

    _onTempUnitChanged() {
        if (this._info && this._info.is_valid()) {
            this._temperature = this._formatTemperature();
            this.emit(WIDGET_SIGNALS.weatherUpdated);
        }
    }

    _formatTemperature() {
        if (!this._info || !this._info.is_valid())
            return null;

        const targetUnit = this._settings
            ? this._settings.get_int(TEMP_UNIT_KEY)
            : TEMP_UNIT_CELSIUS;

        // Try getting numeric temperature directly from GWeather if available
        if (typeof this._info.get_value_temp === 'function') {
            const [ok, valC] = this._info.get_value_temp(GWeather.TemperatureUnit.CENTIGRADE);
            if (ok) {
                if (targetUnit === TEMP_UNIT_FAHRENHEIT) {
                    const valF = valC * FAHRENHEIT_CONVERSION.numerator / FAHRENHEIT_CONVERSION.denominator +
                        FAHRENHEIT_CONVERSION.offset;
                    return `${Math.round(valF)}°F`;
                }
                return `${Math.round(valC)}°C`;
            }
        }

        // Fallback: parse string from get_temp()
        const tempStr = this._info.get_temp();
        if (!tempStr)
            return null;

        const match = String(tempStr).match(/(?<temperature>-?\d+(?:[.,]\d+)?)/);
        if (!match)
            return null;

        const num = parseFloat(match.groups.temperature.replace(',', '.'));
        const isSourceFahrenheit = /°F|℉|[\s°]F\b/i.test(tempStr);

        let tempC;
        if (isSourceFahrenheit)
            tempC = (num - FAHRENHEIT_CONVERSION.offset) *
                FAHRENHEIT_CONVERSION.denominator / FAHRENHEIT_CONVERSION.numerator;
        else
            tempC = num;

        if (targetUnit === TEMP_UNIT_FAHRENHEIT) {
            const valF = isSourceFahrenheit ? num : tempC * FAHRENHEIT_CONVERSION.numerator /
                FAHRENHEIT_CONVERSION.denominator + FAHRENHEIT_CONVERSION.offset;
            return `${Math.round(valF)}°F`;
        }

        return `${Math.round(tempC)}°C`;
    }

    _clearWeather() {
        this._iconName = null;
        this._temperature = null;
    }

    _startTimer() {
        this._timerId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT, UPDATE_INTERVAL_SECONDS, () => {
                if (this._location)
                    this._info.update();
                return GLib.SOURCE_CONTINUE;
            });
    }

    destroy() {
        if (this._timerId) {
            GLib.Source.remove(this._timerId);
            this._timerId = null;
        }
        if (this._locationHelper) {
            this._locationHelper.disconnect(this._locationChangedId);
            this._locationHelper.disconnect(this._locationNameChangedId);
            if (this._ownsLocationHelper)
                this._locationHelper.destroy();
            this._locationHelper = null;
        }
        if (this._info) {
            this._info.disconnect(this._infoUpdatedId);
            this._info.abort();
            this._info = null;
        }
        for (const id of this._settingsChangedIds)
            this._settings.disconnect(id);
        this._settingsChangedIds = [];
        this._settings = null;
        this._location = null;
    }
});
