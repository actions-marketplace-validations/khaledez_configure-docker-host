import fs from "node:fs/promises";
import path from "node:path";
import SSHConfig from "ssh-config";

export const targetDir = `${process.env.HOME}/.ssh`

export async function configure(privateKey, host, user, port) {
  const parsedPort = parsePort(port, 22)

  const keyFile = await writePrivateKeyToDisk(targetDir, host, user, privateKey)

  await writeSSHConfig(`${targetDir}/config`, keyFile, host, user, port)

  return `ssh://${user}@${host}:${parsedPort}`
}

export function parsePort(inputPort, defaultVal) {
  if (typeof (inputPort) === "string") {
    const parsed = parseInt(inputPort)
    return typeof (parsed) == "number" && !isNaN(parsed) && isFinite(parsed) ? parsed : defaultVal
  }
  if (typeof (inputPort) === "number") {
    return inputPort
  }
  return defaultVal
}

export function targetKeyFile(targetDir, host, user) {
  return path.join(targetDir, `${host}-${user}-pk.pem`)
}

export async function writePrivateKeyToDisk(targetDir, host, user, privateKey) {
  await fs.mkdir(targetDir, { recursive: true })

  const targetFile = targetKeyFile(targetDir, host, user)

  if (!privateKey.endsWith("\n")) {
    privateKey += "\n"
  }

  await fs.writeFile(targetFile, privateKey, { mode: 0o600 })

  return targetFile
}

export async function writeSSHConfig(targetConfigFile, keyFilePath, host, user, port) {
  const config = new SSHConfig()
  config.append({
    Host: host,
    HostName: host,
    User: user,
    Port: port,
    IdentityFile: keyFilePath,
    StrictHostKeyChecking: "no",
    IdentitiesOnly: "yes",
    ControlMaster: "auto",
    ControlPath: "~/.ssh/control-%C",
    ControlPersist: "yes",
  })

  try {
    if ((await fs.stat(targetConfigFile)).isFile()) {
      // edit the file
      const configContent = (await fs.readFile(targetConfigFile)).toString()
      const existingConfig = SSHConfig.parse(configContent)

      if (existingConfig.find({ Host: host })) {
        existingConfig.remove({ Host: host })
      }
      existingConfig.append(config.compute(host))
      await fs.writeFile(targetConfigFile, SSHConfig.stringify(existingConfig))
    }
  } catch (error) {
    // create a new file and write
    await fs.writeFile(targetConfigFile, SSHConfig.stringify(config))
  }
}

export async function cleanup(targetDir, host, user) {
  const fileToDelete = targetKeyFile(targetDir, host, user);

  await fs.rm(fileToDelete, { force: true })
}
