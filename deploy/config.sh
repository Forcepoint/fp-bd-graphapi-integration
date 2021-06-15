#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset

readonly _dir="$(cd "$(dirname "${0}")" && pwd)"

readonly _BOLD_WHITE='\033[1;37m'
readonly _NO_COLOR='\033[0m'

validate_prerequisites() {
  local __r=0
  local __prerequisites=("$@")
  local __clear_previous_display="\r\033[K"
  for prerequisite in "${__prerequisites[@]}"; do
    echo -en "${__clear_previous_display}Prerequisite - ${prerequisite} - check" && sleep 0.1
    command -v ${prerequisite} >/dev/null 2>&1 || {
      error "${__clear_previous_display}We require >>> ${prerequisite} <<< but it's not installed. Please try again after installing ${prerequisite}." &&
        __r=1 &&
        break
    }
  done
  echo -en "${__clear_previous_display}"
  return "${__r}"
}

info() {
    local -r __msg="${1}"
    local -r __nobreakline="${2:-""}"
    test ! -z "${__nobreakline}" &&
        printf "${_BOLD_WHITE}${__msg}${_NO_COLOR}" ||
        printf "${_BOLD_WHITE}${__msg}${_NO_COLOR}\n"
}

setup_config() {
    local -r __config_file="${1}"
    local __r=1
    info "Enter Azure Client ID: " "nobreakline"
    read __user_input_1
    info "Enter Azure Tenant ID: " "nobreakline"
    read __user_input_2
    info "Enter Azure Client Secret: " "nobreakline"
    read __user_input_3
    cat <<EOF >"${__config_file}"
services: 
    graph:
        clientId: '${__user_input_1}'
        tenantId: '${__user_input_2}'
        clientSecret: '${__user_input_3}' 

EOF

    sudo chmod 600 "${__config_file}"

    return "${__r}"
}

main() {
    local __prerequisites=(printf)
    validate_prerequisites "${__prerequisites[@]}"
    setup_config "${_dir}"/../config/config.yml
}

main "$@"