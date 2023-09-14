import core from "@actions/core";
import { cleanup, targetDir } from "./configure";

try {
	const host = core.getInput('host');
	const user = core.getInput('user');

	await cleanup(targetDir, host, user)

	console.log(`deleted private key file`)

} catch (error) {
	if (error.message) {
		core.setFailed(error.message);
	} else {
		core.setFailed(error);
	}
}