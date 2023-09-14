import core from "@actions/core";
import { configure } from "./configure.js";

try {
	const privateKey = core.getInput('ssh-private-key');
	const host = core.getInput('host');
	const user = core.getInput('user');
	const port = core.getInput('port');

	const sshUrl = await configure(privateKey, host, user, port);

	core.exportVariable('DOCKER_HOST', sshUrl);
	core.setOutput('ssh-url', sshUrl);

} catch (error) {
	if (error.message) {
		core.setFailed(error.message);
	} else {
		core.setFailed(error);
	}
}
