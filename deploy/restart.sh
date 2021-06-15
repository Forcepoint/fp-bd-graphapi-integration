#!/usr/bin/env bash

main() {
    sudo systemctl restart fp-ms-graph-api-integration.service
}

main "$@"
