#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# Wellness Mobile App — Build & Install Script for Physical Android Device
# ---------------------------------------------------------------------------
# Usage:
#   ./install.sh            # Interactive mode
#   ./install.sh reverse    # Use adb reverse (recommended, USB only)
#   ./install.sh wifi         # Use Wi-Fi LAN IP (same network)
#   ./install.sh emulator     # Use 10.0.2.2 (Android emulator)
# ---------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="${SCRIPT_DIR}/android"
APK_PATH="${ANDROID_DIR}/app/build/outputs/apk/debug/app-debug.apk"
API_TS="${SCRIPT_DIR}/src/services/api.ts"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_err()   { echo -e "${RED}[ERROR]${NC} $1"; }

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

detect_lan_ip() {
  local ip
  ip=$(ip addr show 2>/dev/null | awk '/inet / && !/127\.0\.0\.1/ {print $2; exit}' | cut -d'/' -f1)
  if [[ -z "$ip" ]]; then
    ip=$(ifconfig 2>/dev/null | awk '/inet / && !/127\.0\.0\.1/ {print $2; exit}')
  fi
  echo "$ip"
}

patch_api_url() {
  local new_url="$1"
  log_info "Patching API URL to ${new_url} ..."
  local escaped_url
  escaped_url=$(printf '%s\n' "$new_url" | sed -e 's/[\/&*]/\\&/g')

  if [[ ! -f "$API_TS" ]]; then
    log_err "api.ts not found: $API_TS"
    exit 1
  fi

  # Only patch if the current ANDROID_API_URL is different
  local current_url
  current_url=$(grep -oP "const ANDROID_API_URL = '[^']+'" "$API_TS" | grep -oP "'\K[^']+")

  if [[ "$current_url" == "$new_url" ]]; then
    log_info "ANDROID_API_URL already set to ${new_url}"
    return
  fi

  sed -i "s|const ANDROID_API_URL = '.*';|const ANDROID_API_URL = '${escaped_url}';|" "$API_TS"
  log_ok "Patched ANDROID_API_URL → ${new_url}"
}

check_adb() {
  log_info "Checking for adb ..."
  if ! command -v adb &> /dev/null; then
    log_err "adb is not installed or not in PATH."
    log_info "Install via Android Studio or: https://developer.android.com/studio/releases/platform-tools"
    exit 1
  fi
  log_ok "adb found at $(command -v adb)"
}

check_device() {
  log_info "Checking for connected Android devices ..."
  local devices
  devices=$(adb devices | grep -v "List of devices" | grep "device$" | wc -l)
  if [[ "$devices" -eq 0 ]]; then
    log_err "No Android device detected via adb."
    log_info "Please connect your phone via USB and enable USB debugging."
    exit 1
  fi
  log_ok "Found $devices device(s) connected."
}

# ---------------------------------------------------------------------------
# Modes
# ---------------------------------------------------------------------------

mode_reverse() {
  log_info "Mode: adb reverse (USB)"
  log_info "This forwards localhost:3001 on the phone to your PC."

  patch_api_url "http://localhost:3001"

  log_info "Setting up adb reverse tcp:3001 → tcp:3001 ..."
  adb reverse tcp:3001 tcp:3001
  log_ok "adb reverse configured."
}

mode_wifi() {
  log_info "Mode: Wi-Fi LAN IP"

  local ip
  ip=$(detect_lan_ip)

  if [[ -z "$ip" ]]; then
    log_err "Could not auto-detect your LAN IP."
    read -rp "Please enter your PC's LAN IP (e.g., 192.168.1.42): " ip
  else
    read -rp "Detected LAN IP: ${ip}. Press Enter to use it, or type a different one: " input_ip
    ip="${input_ip:-$ip}"
  fi

  local url="http://${ip}:3001"
  patch_api_url "$url"

  log_warn "Make sure your phone and PC are on the SAME Wi-Fi network."
  log_warn "Verify from phone browser: ${url}/mobile/packages"
}

mode_emulator() {
  log_info "Mode: Android Emulator"
  patch_api_url "http://10.0.2.2:3001"
}

mode_interactive() {
  echo ""
  echo "How do you want to connect the app to the backend?"
  echo ""
  echo "  1) adb reverse  – USB only, works across networks (recommended)"
  echo "  2) Wi-Fi LAN IP – phone & PC must be on same network"
  echo "  3) Emulator     – 10.0.2.2 (Android emulator alias)"
  echo ""
  read -rp "Choose [1-3]: " choice

  case "$choice" in
    1) mode_reverse ;;
    2) mode_wifi ;;
    3) mode_emulator ;;
    *) log_err "Invalid choice"; exit 1 ;;
  esac
}

# ---------------------------------------------------------------------------
# Build & Install
# ---------------------------------------------------------------------------

build_apk() {
  log_info "Building debug APK ..."
  log_info "This may take 1–5 minutes on first run. Gradle output follows:"
  echo "--------------------------------------------------------------------"
  cd "$ANDROID_DIR"
  ./gradlew assembleDebug --info --console=plain
  cd "$SCRIPT_DIR"
  echo "--------------------------------------------------------------------"

  if [[ ! -f "$APK_PATH" ]]; then
    log_err "APK not found after build: $APK_PATH"
    exit 1
  fi

  log_ok "APK built successfully."
}

install_apk() {
  log_info "Installing APK via adb ..."
  log_info "APK path: $APK_PATH"
  adb install -r "$APK_PATH"
  log_ok "Installation complete!"
}

launch_app() {
  log_info "Launching app (com.wellnessmobile) ..."
  adb shell monkey -p com.wellnessmobile -c android.intent.category.LAUNCHER 1 || true
  log_ok "Launch command sent."
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

main() {
  local mode="${1:-}"

  check_adb
  check_device

  if [[ -z "$mode" ]]; then
    mode_interactive
  else
    case "$mode" in
      reverse|r) mode_reverse ;;
      wifi|w)    mode_wifi ;;
      emulator|e) mode_emulator ;;
      *)
        log_err "Unknown mode: $mode"
        echo "Usage: $0 [reverse|wifi|emulator]"
        exit 1
        ;;
    esac
  fi

  build_apk
  install_apk
  launch_app

  echo ""
  log_ok "Done! Check your phone."
}

main "$@"
