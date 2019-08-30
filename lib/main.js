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
const path_1 = __importDefault(require("path"));
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const signale_1 = __importDefault(require("signale"));
const misc_1 = require("./utils/misc");
const command_1 = require("./utils/command");
const github_2 = require("./utils/github");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const version = misc_1.getBuildVersion(path_1.default.resolve(__dirname, '..', 'build.json'));
            if ('string' === typeof version) {
                signale_1.default.info('Version: %s', version);
            }
            signale_1.default.info('Event: %s', github_1.context.eventName);
            signale_1.default.info('Action: %s', github_1.context.payload.action);
            signale_1.default.info('Ref: %s', github_1.context.ref);
            if (!misc_1.isTargetEvent(github_1.context)) {
                signale_1.default.info('This is not target event.');
                return;
            }
            const files = yield command_1.getChangedFiles(github_1.context);
            if (false === files) {
                return;
            }
            yield github_2.push(files, new github_1.GitHub(core_1.getInput('GITHUB_TOKEN', { required: true })), github_1.context);
        }
        catch (error) {
            core_1.setFailed(error.message);
        }
    });
}
run();
