import fs from "node:fs/promises";
import path from "node:path";

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

	await fs.writeFile(targetFile, privateKey)

	return targetFile
}

export async function writeSSHConfig(targetConfigFile, keyFilePath, host, user, port) {
	const configContent = `Host ${host}
	HostName ${host}
	User 	 ${user}
	Port 	 ${port}
	IdentityFile      ${keyFilePath}
    StrictHostKeyChecking no
    IdentitiesOnly    yes
    ControlMaster     auto
    ControlPath       ~/.ssh/control-%C
    ControlPersist    yes
	`

	console.log(configContent)
}

export async function cleanup(targetDir, host, user) {
	const fileToDelete = targetKeyFile(targetDir, host, user);

	await fs.rm(fileToDelete)
}