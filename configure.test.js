import fs from "node:fs/promises";
import os from "node:os";
import { cleanup, parsePort, writePrivateKeyToDisk, writeSSHConfig } from "./configure";

describe("parsing an input port", () => {
	test("parses number correctly", () => {
		expect(parsePort("22")).toBe(22)
		expect(parsePort("0", 10)).toBe(0)
	})
	test("returns the same number if provided by a number", () => {
		expect(parsePort(20)).toBe(20)
	})
	test("return the default if the input is invalid", () => {
		expect(parsePort("d20f", 10)).toBe(10)
		expect(parsePort(undefined, 15)).toBe(15)
	})
})

describe("writing key to disk", () => {
	const privateKey = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACA7Co0wMFbMZeAKbOJHMPA/YhJlav1InTxyoQSztc0tEwAAAJhFKIceRSiH
HgAAAAtzc2gtZWQyNTUxOQAAACA7Co0wMFbMZeAKbOJHMPA/YhJlav1InTxyoQSztc0tEw
AAAEBywWUFBDznwDBldLK6zP3nrN4L/T/+nUb1DPQcIf2NpDsKjTAwVsxl4Aps4kcw8D9i
EmVq/UidPHKhBLO1zS0TAAAAFGtoYWxlZEBtYWNtaW5pLmxvY2FsAQ==
-----END OPENSSH PRIVATE KEY-----`

	test("successful writing and cleanup", async () => {
		const targetDir = os.tmpdir()
		const host = "localhost"
		const user = (Math.random() + 1).toString(36).substring(10)

		const expectedFile = await writePrivateKeyToDisk(targetDir, host, user, privateKey)

		const stats = await fs.stat(expectedFile)
		expect(stats.isFile()).toBe(true)

		expect((await fs.readFile(expectedFile)).toString()).toBe(privateKey + "\n")

		await cleanup(targetDir, host, user)

		await expect(fs.stat(expectedFile)).rejects.toEqual(expect.objectContaining({
			code: "ENOENT"
		}))
	})
})

describe("writing SSH config", () => {
	test("successful writing", async () => {
		await writeSSHConfig("some-file", "~/.ssh/file.pem", "localhost", "root", 22)
	})
})