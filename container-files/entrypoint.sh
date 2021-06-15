#!/usr/bin/env bash

readonly _conf_file_name=config.yml
readonly _dir="$(cd "$(dirname "${0}")" && pwd)"
readonly _home_path="$(cd "${_dir}/.." && pwd)"/"${_HOME_DIR_NAME}"

main() {
    if [ ! -z ${CONFIG_FILE_URL_LOCATION} ]; then
        wget -O "${_home_path}"/config/"${_conf_file_name}" "${CONFIG_FILE_URL_LOCATION}"
    fi

    cd "${_home_path}";
    npm start
}

main "$@"
