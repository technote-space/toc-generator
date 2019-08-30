"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const signale_1 = __importDefault(require("signale"));
const child_process_1 = require("child_process");
const misc_1 = require("./misc");
exports.getChangedFiles = (context) => __awaiter(void 0, void 0, void 0, function* () {
    signale_1.default.info('Running DocToc and getting changed files');
    const workDir = misc_1.getWorkDir();
    fs_1.default.mkdirSync(workDir, { recursive: true });
    if (!(yield clone(workDir, context)))
        return false;
    if (!(yield runDocToc(workDir)))
        return false;
    if (!(yield commit(workDir)))
        return false;
    return getDiff(workDir);
});
const clone = (workDir, context) => __awaiter(void 0, void 0, void 0, function* () {
    const branch = misc_1.getBranch(context);
    const url = misc_1.getGitUrl(context);
    yield execAsync(`git -C ${workDir} clone --quiet --branch=${branch} --depth=1 ${url} .`, false, null, true);
    if ((yield getCurrentBranchName(workDir)) !== branch) {
        signale_1.default.warn('remote branch [%s] not found', branch);
        return false;
    }
    return true;
});
const getCurrentBranchName = (workDir) => __awaiter(void 0, void 0, void 0, function* () {
    if (!fs_1.default.existsSync(path_1.default.resolve(workDir, '.git'))) {
        return '';
    }
    return (yield execAsync(`git -C ${workDir} branch -a | grep -E '^\\*' | cut -b 3-`)).trim();
});
const runDocToc = (workDir) => __awaiter(void 0, void 0, void 0, function* () {
    const args = misc_1.getDocTocArgs();
    const doctoc = path_1.default.resolve(workDir, 'node_modules/.bin/doctoc');
    yield execAsync(`yarn --cwd ${workDir} add doctoc`);
    yield execAsync(`${doctoc} ${args} --github`);
    yield execAsync(`yarn --cwd ${workDir} remove doctoc`);
    return true;
});
const commit = (workDir) => __awaiter(void 0, void 0, void 0, function* () {
    yield execAsync(`git -C ${workDir} add --all`);
    return true;
});
const getDiff = (workDir) => __awaiter(void 0, void 0, void 0, function* () { return (yield execAsync(`git -C ${workDir} status --short -uno`, false, null, false, true)).split(/\r\n|\n/).filter(line => line.match(/^M\s+/)).map(line => line.replace(/^M\s+/, '')); });
const execAsync = (command, quiet = false, altCommand = null, suppressError = false, suppressOutput = false) => new Promise((resolve, reject) => {
    if ('string' === typeof altCommand)
        signale_1.default.info('Run command: %s', altCommand);
    else if (!quiet)
        signale_1.default.info('Run command: %s', command);
    child_process_1.exec(command + (quiet ? ' > /dev/null 2>&1' : '') + (suppressError ? ' || :' : ''), (error, stdout) => {
        if (error) {
            if ('string' === typeof altCommand && !quiet)
                reject(new Error(`command [${altCommand}] exited with code ${error.code}. message: ${error.message}`));
            else if ('string' === typeof altCommand)
                reject(new Error(`command [${altCommand}] exited with code ${error.code}.`));
            else if (!quiet)
                reject(new Error(`command [${command}] exited with code ${error.code}. message: ${error.message}`));
            else
                reject(new Error(`command exited with code ${error.code}.`));
        }
        else {
            if (!quiet && !suppressOutput)
                console.log(stdout);
            resolve(stdout);
        }
    });
});
