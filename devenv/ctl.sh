#!/usr/bin/env bash

check_command() {
  if ! [ -x "$(command -v $1)" ]; then
    echo "Error: $1 is not installed. Please install before continuing." >&2
    exit 1
  fi
}

# Run the entire stack in development mode using docker compose

check_command docker
check_command docker compose

DEVENV_DIR="$(cd $(dirname $([ -L $0 ] && readlink -f $0 || echo $0)) && pwd)"
PROJECT_ARGS="-p albion-killbot"
COMPOSE_FILE="-f $DEVENV_DIR/docker-compose.yml"
ARGS="$PROJECT_ARGS $COMPOSE_FILE"

script=$(basename $0)
cmd=$1; shift 2>/dev/null
component=$1; shift 2>/dev/null

Build() {
  docker compose $ARGS build
}

Start() {
  docker compose $ARGS up -d $component $@
}

Stop() {
  docker compose $ARGS down
}

Restart() {
  Stop; Start $@
}

Logs() {
  # If exit code is zero (normal exits), just run it again
  while [ $? -eq "0" ]; do
    docker compose $ARGS logs -f $component
  done
}

Shell() {
  if [ -z $component ]; then
    echo "Usage: $script shell [component]"
    exit 1
  fi
  docker compose $ARGS exec $component bash
}

Exec() {
  if [ -z $component ] || [ -z $1 ]; then
    echo "Usage: $script exec [component] [commands]"
    exit 1
  fi
  docker compose $ARGS exec $component $@
}

Migrate() {
  docker compose $ARGS run --rm bot npm run db:migrate
}

DockerCompose() {
  docker compose $ARGS $component $@
}

Help() {
  printf "This scripts is a helper for docker compose for dev-env.\n"
  printf "\nUsage: $script COMMAND\n"
  printf "\nCommands:\n"
  printf "\tbuild\t\t\tBuild all components\n"
  printf "\tstart\t\t\tStart the stack in detached mode\n"
  printf "\tstop\t\t\tShutdown the stack\n"
  printf "\trestart\t\t\tRestart the stack\n"
  printf "\tmigrate\t\t\tRun migrations\n"
  printf "\texec [component]\tExecute a single command in the target component\n"
  printf "\tshell [component]\tOpen a bash shell in the target component\n"
  printf "\tlogs [component]\tGet logs for component or all logs with tail mode\n"
  printf "\tcmd <cmd>\t\tShorthand for docker compose $ARGS <cmd>\n"
  printf "\nComponents:\n"
  printf "\tcrawler\t\t\tAlbion api crawler\n"
  printf "\tbot\t\t\tDiscord bot\n"
  printf "\tapi\t\t\tWeb REST api\n"
  printf "\tdashboard\t\tDashboard frontend\n"
  exit 0
}

case $cmd in
  build) Build $@ ;;
  cmd) DockerCompose $@ ;;
  exec) Exec $@ ;;
  help) Help $@ ;;
  logs) Logs $@ ;;
  migrate) Migrate $@ ;;
  restart) Restart $@ ;;
  shell) Shell $@ ;;
  start) Start $@ ;;
  stop) Stop $@ ;;
  *) Help $@ ;;
esac
