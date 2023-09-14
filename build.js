import { execSync } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"
import pkg from "./package.json" assert { type: "json" }

const dist = "dist"

const targetPackage = {
	type: "module",
	dependencies: pkg.dependencies
}

await fs.writeFile(path.join(dist, "package.json"), JSON.stringify(targetPackage))

console.log(execSync("npm install", { cwd: path.join(process.cwd(), dist) }).toString())