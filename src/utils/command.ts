import fs from 'fs';
import path from 'path';
import signale from 'signale';
import {exec} from 'child_process';
import {Context} from '@actions/github/lib/context';
import {getBranch, getDocTocArgs, getGitUrl, getWorkDir} from './misc';

export const getChangedFiles = async (context: Context): Promise<string[] | false> => {
    signale.info('Running DocToc and getting changed files');
    const workDir = getWorkDir();

    if (!await clone(workDir, context)) return false;
    if (!await runDocToc(workDir)) return false;
    if (!await commit(workDir)) return false;

    return getDiff(workDir);
};

const clone = async (workDir: string, context: Context): Promise<boolean> => {
    const branch = getBranch(context);
    const url = getGitUrl(context);
    await execAsync(`git -C ${workDir} clone --quiet --branch=${branch} --depth=1 ${url} .`, false, null, true);

    if (await getCurrentBranchName(workDir) !== branch) {
        signale.warn('remote branch %s not found', branch);
        return false;
    }

    return true;
};

const getCurrentBranchName = async (workDir: string): Promise<string> => {
    if (!fs.existsSync(path.resolve(workDir, '.git'))) {
        return '';
    }
    return (await execAsync(`git -C ${workDir} branch -a | grep -E '^\\*' | cut -b 3-`)).trim();
};

const runDocToc = async (workDir: string): Promise<boolean> => {
    const args = getDocTocArgs();
    await execAsync('cd ${workDir} && yarn add doctoc');
    await execAsync(`cd ${workDir} && ./node_modules/.bin/doctoc ${args}`);
    return true;
};

const commit = async (workDir: string): Promise<boolean> => {
    await execAsync(`git -C ${workDir} add --all`);
    return true;
};

const getDiff = async (workDir: string): Promise<string[]> => (await execAsync(`git -C ${workDir} status --short -uno`, false, null, false, true)).split(/\r\n|\n/).filter(line => line.match(/^M\s+/));

const execAsync = (command: string, quiet: boolean = false, altCommand: string | null = null, suppressError: boolean = false, suppressOutput: boolean = false) => new Promise<string>((resolve, reject) => {
    if ('string' === typeof altCommand) signale.info('Run command: %s', altCommand);
    else if (!quiet) signale.info('Run command: %s', command);
    exec(command + (quiet ? ' > /dev/null 2>&1' : '') + (suppressError ? ' || :' : ''), (error, stdout) => {
        if (error) {
            if ('string' === typeof altCommand && !quiet) reject(new Error(`command [${altCommand}] exited with code ${error.code}. message: ${error.message}`));
            else if ('string' === typeof altCommand) reject(new Error(`command [${altCommand}] exited with code ${error.code}.`));
            else if (!quiet) reject(new Error(`command [${command}] exited with code ${error.code}. message: ${error.message}`));
            else reject(new Error(`command exited with code ${error.code}.`));
        } else {
            if (!quiet && !suppressOutput) console.log(stdout);
            resolve(stdout);
        }
    });
});
