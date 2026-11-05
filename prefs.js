'use strict';

import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import {POSITION_KEYS, migratePositionSettings} from './widgets/position.js';
import {CLOCK_KEYS, CLOCK_STYLE, COLOR_FORMAT, EFFECT_KEYS, LOCATION_NAME_PROVIDER, OPACITY_CONFIG, POSITION_CONFIG, REFLECTION_STYLE, SPONSOR_LAYOUT, TEMPERATURE_UNIT, WEATHER_CONFIG, WEATHER_KEYS, WIDGET_KEYS, WORLD_CLOCK_KEYS} from './widgets/settings.js';

function appendEnumChoices(model, choices) {
    for (const [id, label] of choices) {
        if (model.get_n_items() !== id)
            throw new Error('Choice positions must match stored settings identifiers');
        model.append(label);
    }
}

export default class GlassWidgetsPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        migratePositionSettings(settings);

        // General page
        const generalPage = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'preferences-other-symbolic',
        });
        window.add(generalPage);

        const widgetsGroup = new Adw.PreferencesGroup({title: _('Widgets')});
        generalPage.add(widgetsGroup);

        const showClockRow = new Adw.SwitchRow({
            title: _('Clock widget'),
            subtitle: _('Show a frosted glass clock on the desktop'),
        });
        settings.bind(WIDGET_KEYS.clock, showClockRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        widgetsGroup.add(showClockRow);

        const showStatsRow = new Adw.SwitchRow({
            title: _('System stats widget'),
            subtitle: _('Show RAM and CPU usage on the desktop'),
        });
        settings.bind(WIDGET_KEYS.stats, showStatsRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        widgetsGroup.add(showStatsRow);

        const showWeatherRow = new Adw.SwitchRow({
            title: _('Weather in clock widget'),
            subtitle: _('Show current conditions with the clock'),
        });
        settings.bind(WIDGET_KEYS.clockWeather, showWeatherRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        widgetsGroup.add(showWeatherRow);

        const showHourlyRow = new Adw.SwitchRow({
            title: _('Hourly weather forecast'),
            subtitle: _('Show the next six hours of weather'),
        });
        settings.bind(WIDGET_KEYS.hourly, showHourlyRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        widgetsGroup.add(showHourlyRow);

        const showWeeklyRow = new Adw.SwitchRow({
            title: _('Weekly weather forecast'),
            subtitle: _('Show the seven-day weather forecast'),
        });
        settings.bind(WIDGET_KEYS.weekly, showWeeklyRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        widgetsGroup.add(showWeeklyRow);

        const showCalendarRow = new Adw.SwitchRow({
            title: _('Calendar widget'),
            subtitle: _('Show the current month calendar on the desktop'),
        });
        settings.bind(WIDGET_KEYS.calendar, showCalendarRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        widgetsGroup.add(showCalendarRow);

        const showWorldClockRow = new Adw.SwitchRow({
            title: _('World clock widget'),
            subtitle: _('Show a multi-timezone analog clock on the desktop'),
        });
        settings.bind(WIDGET_KEYS.worldclock, showWorldClockRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        widgetsGroup.add(showWorldClockRow);

        // Media player widget is deliberately deferred and kept disabled in the
        // current build. It will be shipped later once the D-Bus sandboxing issues
        // have been addressed and tested.
        // const showMediaPlayerRow = new Adw.SwitchRow({
        //     title: _('Media player widget'),
        //     subtitle: _('Show controls and track information for a running media player'),
        // });
        // settings.bind('show-media-player', showMediaPlayerRow, 'active', 0);
        // widgetsGroup.add(showMediaPlayerRow);

        const worldClockPage = new Adw.PreferencesPage({
            title: _('World Clock'),
            icon_name: 'preferences-clock-symbolic',
        });
        window.add(worldClockPage);

        const worldClockGroup = new Adw.PreferencesGroup({title: _('World Clock')});
        worldClockPage.add(worldClockGroup);

        const worldClockEntriesRow = new Adw.EntryRow({
            title: _('World clock timezones'),
            text: settings.get_strv(WORLD_CLOCK_KEYS.entries).map((value) => {
                try {
                    return JSON.parse(value).tz;
                } catch {
                    return '';
                }
            }).filter(Boolean).join(', '),
        });
        const worldClockHelp = new Adw.ActionRow({
            title: _('Example: UTC, Africa/Nairobi, Europe/London, Asia/Tokyo, America/Sao_Paulo, America/New_York'),
        });
        worldClockGroup.add(worldClockHelp);
        const refreshWorldClockEntries = () => {
            const text = worldClockEntriesRow.text.trim();
            if (!text) {
                settings.set_strv(WORLD_CLOCK_KEYS.entries, []);
                return;
            }
            const entries = text.split(',').map((value) => value.trim()).filter(Boolean);
            settings.set_strv(WORLD_CLOCK_KEYS.entries, entries.map((tz) => JSON.stringify({
                tz,
                label: tz.split('/').pop().replace(/_/g, ' '),
            })));
        };
        worldClockEntriesRow.connect('notify::text', refreshWorldClockEntries);
        worldClockGroup.add(worldClockEntriesRow);

        for (const {key, title} of [
            {key: WORLD_CLOCK_KEYS.showTicks, title: _('World clock hour marks')},
            {key: WORLD_CLOCK_KEYS.showSeconds, title: _('World clock second hand')},
            {key: WORLD_CLOCK_KEYS.showNumbers, title: _('World clock dial numbers')},
            {key: WORLD_CLOCK_KEYS.showRelativeTime, title: _('World clock relative time')},
        ]) {
            const row = new Adw.SwitchRow({title});
            settings.bind(key, row, 'active', Gio.SettingsBindFlags.DEFAULT);
            worldClockGroup.add(row);
        }

        // Clock Style page
        const clockStylePage = new Adw.PreferencesPage({
            title: _('Clock Style'),
            icon_name: 'preferences-clock-symbolic',
        });
        window.add(clockStylePage);

        const clockStyleGroup = new Adw.PreferencesGroup({title: _('Clock Style')});
        clockStylePage.add(clockStyleGroup);

        const overrideRow = new Adw.SwitchRow({
            title: _('Enable clock style override'),
            subtitle: _('Use custom clock styling instead of the stylesheet default'),
        });
        settings.bind(CLOCK_KEYS.styleOverride, overrideRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        clockStyleGroup.add(overrideRow);

        const formatRow = new Adw.SwitchRow({
            title: _('24-hour format'),
            subtitle: _('Use a 24-hour clock instead of 12-hour'),
        });
        settings.bind(CLOCK_KEYS.format24h, formatRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        clockStyleGroup.add(formatRow);

        const weightRow = new Adw.SpinRow({
            title: _('Font weight'),
            subtitle: _('100 (thin) to 900 (black)'),
            adjustment: new Gtk.Adjustment({
                lower: CLOCK_STYLE.minimumFontWeight,
                upper: CLOCK_STYLE.maximumFontWeight,
                step_increment: CLOCK_STYLE.fontWeightStep,
                page_increment: CLOCK_STYLE.fontWeightPageStep,
                value: settings.get_int(CLOCK_KEYS.fontWeight),
            }),
        });
        settings.bind(CLOCK_KEYS.fontWeight, weightRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        clockStyleGroup.add(weightRow);

        const ratioValue = Math.max(CLOCK_STYLE.minimumHourRatio, Math.min(CLOCK_STYLE.maximumHourRatio,
            settings.get_double(CLOCK_KEYS.hourMinuteSizeRatio)));
        const ratioRow = new Adw.SpinRow({
            title: _('Hour/minute size ratio'),
            subtitle: _('0.5 = smaller hours, 1.0 = equal size, 1.5 = bigger hours'),
            digits: CLOCK_STYLE.ratioDecimalPlaces,
            adjustment: new Gtk.Adjustment({
                lower: CLOCK_STYLE.minimumHourRatio,
                upper: CLOCK_STYLE.maximumHourRatio,
                step_increment: CLOCK_STYLE.ratioStep,
                page_increment: CLOCK_STYLE.ratioPageStep,
                value: ratioValue,
            }),
        });
        settings.bind(CLOCK_KEYS.hourMinuteSizeRatio, ratioRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        clockStyleGroup.add(ratioRow);

        const colorButton = new Gtk.ColorDialogButton({valign: Gtk.Align.CENTER});
        const colorRow = new Adw.ActionRow({
            title: _('Clock color'),
            subtitle: _('Color used when the clock style override is enabled'),
        });
        colorRow.add_suffix(colorButton);
        clockStyleGroup.add(colorRow);
        // GSettings has no native color type – bind the hex string manually.
        const syncColor = () => {
            const rgba = colorButton.get_rgba();
            const hex = '#' + [rgba.red, rgba.green, rgba.blue]
                .map(channel => Math.round(channel * COLOR_FORMAT.channelMaximum)
                    .toString(COLOR_FORMAT.hexRadix).padStart(COLOR_FORMAT.hexChannelLength, '0')).join('');
            if (settings.get_string(CLOCK_KEYS.color) !== hex)
                settings.set_string(CLOCK_KEYS.color, hex);
        };
        colorButton.connect('notify::rgba', syncColor);
        const initColor = () => {
            const hex = settings.get_string(CLOCK_KEYS.color);
            const rgba = new Gdk.RGBA();
            if (!rgba.parse(hex))
                rgba.parse(CLOCK_STYLE.defaultColor);
            colorButton.set_rgba(rgba);
        };
        initColor();
        const colorSettingsId = settings.connect(`changed::${CLOCK_KEYS.color}`, initColor);
        window.connect('close-request', () => {
            settings.disconnect(colorSettingsId);
            return false;
        });

        // Weather page
        const weatherPage = new Adw.PreferencesPage({
            title: _('Weather'),
            icon_name: 'weather-clear-symbolic',
        });
        window.add(weatherPage);

        const locationGroup = new Adw.PreferencesGroup({
            title: _('Location'),
            description: _('Online name services receive your coordinates. Data: OpenStreetMap contributors (ODbL).'),
        });
        weatherPage.add(locationGroup);

        const autoLocationRow = new Adw.SwitchRow({
            title: _('Automatic location'),
            subtitle: _('Detect your location automatically. Falls back to the manual coordinates below when unavailable.'),
        });
        settings.bind(WEATHER_KEYS.autoLocation, autoLocationRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        locationGroup.add(autoLocationRow);

        const nameProviderModel = new Gtk.StringList();
        appendEnumChoices(nameProviderModel, new Map([
            [LOCATION_NAME_PROVIDER.LOCAL, _('Local - GWeather')],
            [LOCATION_NAME_PROVIDER.NOMINATIM, _('Nominatim')],
            [LOCATION_NAME_PROVIDER.PHOTON, _('Photon')],
        ]));

        const nameProviderRow = new Adw.ComboRow({
            title: _('Location name provider'),
            subtitle: _('Coordinate lookup'),
            model: nameProviderModel,
        });
        settings.bind(WEATHER_KEYS.nameProvider, nameProviderRow, 'selected', Gio.SettingsBindFlags.DEFAULT);
        locationGroup.add(nameProviderRow);

        const latRow = new Adw.SpinRow({
            title: _('Latitude'),
            subtitle: _('Used when automatic location is unavailable'),
            digits: WEATHER_CONFIG.coordinateDecimalPlaces,
            adjustment: new Gtk.Adjustment({
                lower: -WEATHER_CONFIG.latitudeLimit,
                upper: WEATHER_CONFIG.latitudeLimit,
                step_increment: WEATHER_CONFIG.coordinateStep,
                page_increment: WEATHER_CONFIG.coordinatePageStep,
                value: settings.get_double(WEATHER_KEYS.latitude),
            }),
        });
        settings.bind(WEATHER_KEYS.latitude, latRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        locationGroup.add(latRow);

        const lonRow = new Adw.SpinRow({
            title: _('Longitude'),
            subtitle: _('Used when automatic location is unavailable'),
            digits: WEATHER_CONFIG.coordinateDecimalPlaces,
            adjustment: new Gtk.Adjustment({
                lower: -WEATHER_CONFIG.longitudeLimit,
                upper: WEATHER_CONFIG.longitudeLimit,
                step_increment: WEATHER_CONFIG.coordinateStep,
                page_increment: WEATHER_CONFIG.coordinatePageStep,
                value: settings.get_double(WEATHER_KEYS.longitude),
            }),
        });
        settings.bind(WEATHER_KEYS.longitude, lonRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        locationGroup.add(lonRow);

        const tempGroup = new Adw.PreferencesGroup({title: _('Temperature')});
        weatherPage.add(tempGroup);

        const tempUnitModel = new Gtk.StringList();
        appendEnumChoices(tempUnitModel, new Map([
            [TEMPERATURE_UNIT.CELSIUS, _('Celsius')],
            [TEMPERATURE_UNIT.FAHRENHEIT, _('Fahrenheit')],
        ]));

        const tempUnitRow = new Adw.ComboRow({
            title: _('Temperature unit'),
            subtitle: _('Choose how temperatures are displayed'),
            model: tempUnitModel,
        });
        settings.bind(WEATHER_KEYS.temperatureUnit, tempUnitRow, 'selected', Gio.SettingsBindFlags.DEFAULT);
        tempGroup.add(tempUnitRow);

        // Position page
        const positionPage = new Adw.PreferencesPage({
            title: _('Position'),
            icon_name: 'preferences-position-symbolic',
        });
        window.add(positionPage);

        const posGroup = new Adw.PreferencesGroup({title: _('Widget Position')});
        positionPage.add(posGroup);
        const addPositionRows = (label, xKey, yKey) => {
            const group = new Adw.PreferencesGroup({title: label});
            positionPage.add(group);
            const xRow = new Adw.SpinRow({
                title: _('Horizontal position (%)'),
                subtitle: _('0 = left edge, 100 = right edge'),
                digits: POSITION_CONFIG.decimalPlaces,
                snap_to_ticks: false,
                adjustment: new Gtk.Adjustment({
                    lower: POSITION_CONFIG.minimumPercent,
                    upper: POSITION_CONFIG.maximumPercent,
                    step_increment: POSITION_CONFIG.stepPercent,
                    page_increment: POSITION_CONFIG.pageStepPercent,
                    value: settings.get_double(xKey),
                }),
            });
            settings.bind(xKey, xRow, 'value', Gio.SettingsBindFlags.DEFAULT);
            group.add(xRow);
            const yRow = new Adw.SpinRow({
                title: _('Vertical position (%)'),
                subtitle: _('0 = top edge, 100 = bottom edge'),
                digits: POSITION_CONFIG.decimalPlaces,
                snap_to_ticks: false,
                adjustment: new Gtk.Adjustment({
                    lower: POSITION_CONFIG.minimumPercent,
                    upper: POSITION_CONFIG.maximumPercent,
                    step_increment: POSITION_CONFIG.stepPercent,
                    page_increment: POSITION_CONFIG.pageStepPercent,
                    value: settings.get_double(yKey),
                }),
            });
            settings.bind(yKey, yRow, 'value', Gio.SettingsBindFlags.DEFAULT);
            group.add(yRow);
        };

        addPositionRows(_('Clock position'), ...POSITION_KEYS.clock);
        addPositionRows(_('Stats position'), ...POSITION_KEYS.stats);
        addPositionRows(_('Calendar position'), ...POSITION_KEYS.calendar);
        addPositionRows(_('World clock position'), ...POSITION_KEYS.worldclock);
        addPositionRows(_('Hourly forecast position'), ...POSITION_KEYS.hourly);
        addPositionRows(_('Weekly forecast position'), ...POSITION_KEYS.weekly);
        // Media player position is intentionally not exposed in the stable build.
        // The widget will ship later after the app sandboxing issues are resolved.
        // addPositionRows(_('Media player position'), 'media-x', 'media-y');

        const opacityRow = new Adw.SpinRow({
            title: _('Opacity'),
            subtitle: _('Widget transparency (0 = invisible, 1 = opaque)'),
            digits: OPACITY_CONFIG.decimalPlaces,
            adjustment: new Gtk.Adjustment({
                lower: OPACITY_CONFIG.minimum,
                upper: OPACITY_CONFIG.maximum,
                step_increment: OPACITY_CONFIG.step,
                page_increment: OPACITY_CONFIG.pageStep,
                value: settings.get_double(EFFECT_KEYS.opacity),
            }),
        });
        settings.bind(EFFECT_KEYS.opacity, opacityRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        posGroup.add(opacityRow);

        const effectsPage = new Adw.PreferencesPage({
            title: _('Effects'),
            icon_name: 'preferences-desktop-display-symbolic',
        });
        window.add(effectsPage);

        const effectsGroup = new Adw.PreferencesGroup({title: _('Visual effects')});
        effectsPage.add(effectsGroup);

        const blurRow = new Adw.SwitchRow({
            title: _('Blur effect'),
            subtitle: _('Apply a frosted glass blur behind the widgets'),
        });
        settings.bind(EFFECT_KEYS.blurEnabled, blurRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        effectsGroup.add(blurRow);

        const reflectionRow = new Adw.SwitchRow({
            title: _('Glass reflection'),
            subtitle: _('Add a subtle sheen across the top of each widget'),
        });
        settings.bind(EFFECT_KEYS.reflectionEnabled, reflectionRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        effectsGroup.add(reflectionRow);

        const reflectionStyleRow = new Adw.ComboRow({
            title: _('Reflection style'),
            subtitle: _('Choose the kind of glass reflection to apply'),
            model: (() => {
                const model = new Gtk.StringList();
                appendEnumChoices(model, new Map([
                    [REFLECTION_STYLE.SHEEN, _('Sheen')],
                    [REFLECTION_STYLE.MIRROR, _('Mirror')],
                ]));
                return model;
            })(),
        });
        settings.bind(EFFECT_KEYS.reflectionStyle, reflectionStyleRow, 'selected', Gio.SettingsBindFlags.DEFAULT);
        effectsGroup.add(reflectionStyleRow);

        const sponsorPage = new Adw.PreferencesPage({
            title: _('Sponsor'),
            icon_name: 'emblem-favorite-symbolic',
        });
        window.add(sponsorPage);

        const sponsorGroup = new Adw.PreferencesGroup({title: _('Support Glass Widgets')});
        sponsorPage.add(sponsorGroup);

        const sponsorContent = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: SPONSOR_LAYOUT.spacing,
            margin_top: SPONSOR_LAYOUT.margin,
            margin_bottom: SPONSOR_LAYOUT.margin,
            margin_start: SPONSOR_LAYOUT.margin,
            margin_end: SPONSOR_LAYOUT.margin,
        });
        const sponsorMessage = new Gtk.Label({
            label: _('Glass-widgets is free, if you\'d like to support it, a coffee goes toward keeping it working through GNOME Shell updates.'),
            wrap: true,
            justify: Gtk.Justification.CENTER,
        });
        sponsorContent.append(sponsorMessage);

        const qrCode = Gtk.Picture.new_for_filename(`${this.path}/screenshots/sponsor/qr-code.png`);
        qrCode.set_size_request(SPONSOR_LAYOUT.qrSize, SPONSOR_LAYOUT.qrSize);
        qrCode.set_can_shrink(true);
        qrCode.set_halign(Gtk.Align.CENTER);
        qrCode.set_valign(Gtk.Align.CENTER);
        qrCode.set_alternative_text(_('QR code to buy the developer a coffee'));
        sponsorContent.append(qrCode);

        const qrCaption = new Gtk.Label({
            label: _('Scan to buy me a coffee, it keeps glass-widgets running through GNOME Shell updates.'),
            wrap: true,
            justify: Gtk.Justification.CENTER,
        });
        sponsorContent.append(qrCaption);
        sponsorGroup.add(sponsorContent);
    }
}
