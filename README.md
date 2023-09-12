# Configure docker host action

This action configure openssh with the host information you need to connect to a remote docker engine using ssh.
It basically does two things; 1) add an entry in `~/.ssh/config` with credentials and username.
2) set the DOCKER_HOST environment variable.


## Inputs

### `ssh-private-key`

**Required** The private key will be used to connect to the remote host

### `host`

**Required** The host IP or Domain name that has the docker engine running

### `user`

**Required** The username to authenticate with. This use must be able to run docker commands on the target host

### `port`

The ssh port to connect to the remote host. Default: `22`

## Outputs

## `ssh-url`

A URL that can be used to set DOCKER_HOST environment variable
