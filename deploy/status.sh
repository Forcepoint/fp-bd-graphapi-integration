#!/usr/bin/env bash

main() {
    sudo systemctl status fp-ms-graph-api-integration.service
}

main "$@"
