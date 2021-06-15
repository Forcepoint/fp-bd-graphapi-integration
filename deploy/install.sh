#!/usr/bin/env bash

readonly _dir="$(cd "$(dirname "${0}")" && pwd)"
readonly _home_folder="$(cd "${_dir}/.." && pwd)"

install_prerequisite_centos() {
    echo "install_prerequisite_centos"
    sudo yum update -y
    curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -
    sudo yum install -y nodejs gcc-c++ make
}

install_prerequisite_debian() {
    echo "install_prerequisite_debian"
    sudo apt update
    sudo apt install -y curl
    curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
    sudo apt install -y nodejs gcc g++ make
}

# this only made to cater for centos7 and ubuntu18
main() {
    hostnamectl | grep -qi centos && install_prerequisite_centos || install_prerequisite_debian
    sudo chmod ugo+rw "${_home_folder}"/config/*.yml
    sudo chmod +x "${_dir}"/*.sh
}

main "$@"
