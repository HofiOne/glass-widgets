'use strict';

import Gio from 'gi://Gio';

const metadataFile = Gio.File.new_for_uri(import.meta.url).get_parent()
    .get_parent().get_child('metadata.json');
const [, contents] = metadataFile.load_contents(null);

const metadata = JSON.parse(new TextDecoder().decode(contents));

export const PROJECT_URL = metadata.url;
export const APP_ID = metadata['settings-schema'];