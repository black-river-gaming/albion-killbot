#!/bin/env sh

function check_command() {
  if ! [ -x "$(command -v $1)" ]; then
    echo "Error: $1 is not installed. Please install before continuing." >&2
    exit 1
  fi
}

# Run the entire stack in development mode using docker-compose

check_command docker
check_command docker-compose

PROJECT_ARGS="-p albion-killbot"
COMPOSE_FILE="-f docker/docker-compose.yml"
args="$PROJECT_ARGS $COMPOSE_FILE"

cmd=$1; shift 2>/dev/null
component=$1; shift 2>/dev/null

Build() {
  docker-compose $args build
}

Start() {
  docker-compose $args up -d $component $@
}

Stop() {
  docker-compose $args down $component $@
}

Restart() {
  Stop; Start
}

Logs() {
  # If exit code is zero (normal exits), just run it again
  while [ $? -eq "0" ]; do
    docker-compose $args logs -f $component
  done
}

Shell() {
  if [ -z $component ]; then
    echo "Usage: $0 shell [component]"
    exit 1
  fi
  docker-compose $args exec $component bash
}

Exec() {
  if [ -z $component ] || [ -z $1 ]; then
    echo "Usage: $0 exec [component] [commands]"
    exit 1
  fi
  docker-compose $args exec $component $@
}

Help() {
  printf "This scripts is a helper for docker-compose for dev-env.\n"
  printf "\nUsage: $0 COMMAND\n"
  printf "\nCommands:\n"
  printf "\tbuild\t\t\tBuild all components\n"
  printf "\tstart\t\t\tStart the stack in detached mode\n"
  printf "\tstop\t\t\tShutdown the stack\n"
  printf "\trestart\t\t\tRestart the stack\n"
  printf "\texec [component]\tExecute a single command in the target component\n"
  printf "\tshell [component]\tOpen a bash shell in the target component\n"
  printf "\tlogs [component]\tGet logs for component or all logs with tail mode\n"
  printf "\nComponents:\n"
  printf "\tcrawler\t\t\tAlbion api crawler\n"
  printf "\tbot\t\t\tDiscord bot\n"
  printf "\tapi\t\t\tWeb REST api\n"
  exit 0
}

case $cmd in
  build) Build $@ ;;
  exec) Exec $@ ;;
  help) Help $@ ;;
  logs) Logs $@ ;;
  restart) Restart $@ ;;
  shell) Shell $@ ;;
  start) Start $@ ;;
  stop) Stop $@ ;;
  *) Help $@ ;;
esac
