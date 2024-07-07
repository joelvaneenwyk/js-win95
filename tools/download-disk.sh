#!/bin/bash

function download_disk_image() {
    set -ea -o pipefail

    ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && cd .. && pwd)"

    if [ ! -f "$ROOT_DIR/.env" ]; then
        if [ -e "$(command -v npx)" ]; then
          printf "Pulling latest '.env' with 'dotenv-vault' using 'npx' command."
          npx --yes dotenv-vault@latest pull --yes
        fi

        if [ ! -f "$ROOT_DIR/.env" ]; then
            printf "No '.env' file found. Exiting.\n"
            return 78
        fi
    fi

    # Load environment variables if available
    if [ -f "$ROOT_DIR/.env" ]; then
        # Split on newline and equal sign so we get a key/value pair
        declare -p IFS
        declare -x IFS="=
"
        while read -r key value; do
            local status="undefined"

            if [[ -z "${key:-}" ]] || [[ "${key:-}" == "#"* ]]; then
                status="skipped"
                key="# COMMENT REDACTED"
                value=""
            else
                status="exported"
                value="${value:-}"
                value="${value%\"}"
                value="${value#\"}"
                printf -v "$key" "%s" "${value:-}"
                value="REDACTED"
            fi
            printf "[%09s] {key: '%s', value: '%s'}\n" "${status:-}" "${key:-}" "${value:-}" | tee -a "$logs_dir/win95_emulator_download_disk.log"
        done <"$ROOT_DIR/.env"
        printf "Loaded environment variables: '%s'\n" "$ROOT_DIR/.env"
    else
        printf "Skipped loading environment variables. No '.env' found: '%s'\n" "$ROOT_DIR/.env"
    fi

    if [ -z "${DISK_URL:-}" ]; then
        printf "DISK_URL is not set. Exiting.\n"
        return 80
    fi

    images_dir="$ROOT_DIR/images"
    mkdir -p "$images_dir"

    logs_dir="$ROOT_DIR/.build/logs"
    mkdir -p "$logs_dir"

    local image_target_path="$images_dir/images.zip"
    if wget -O "$image_target_path" "$DISK_URL"; then
        printf "Downloaded disk image: '%s'\n" "$image_target_path"
    else
        return 81
    fi

    if [ -z "${DISK_URL:-}" ]; then
        printf "'DISK_URL' is not set. Exiting.\n"
        return 80
    fi

    if unzip -o "$image_target_path" -d "$images_dir"; then
        rm -rf "$images_dir/__MACOSX"
        ls "$images_dir" >"$images_dir/manifest.txt"
        printf "Unzipped disk image: '%s'\n" "$images_dir"
    else
        return 82
    fi

    return 0
}

function main() {
    local return_value=0
    set -ea
    if download_disk_image "$@"; then
        printf "Downloaded disk image successfully.\n"
    else
        return_value=$?
        printf "Failed to download disk image. Error code: %d\n" "$return_value"
    fi
    set +x
    return $return_value
}

main "$@"
