"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformWithWrap = exports.normalizeMarkerComment = void 0;
const transform_1 = __importStar(require("doctoc/lib/transform"));
const update_section_1 = __importDefault(require("update-section"));
const fs_1 = require("fs");
const github_action_helper_1 = require("@technote-space/github-action-helper");
const misc_1 = require("./misc");
const constant_1 = require("../constant");
const matchesStart = (line) => github_action_helper_1.Utils.getRegExp(constant_1.OPENING_COMMENT).test(line);
const matchesEnd = (line) => github_action_helper_1.Utils.getRegExp(constant_1.CLOSING_COMMENT).test(line);
exports.normalizeMarkerComment = (contents) => {
    const replacedOpening = misc_1.getArrayInput('OPENING_COMMENT').reduce((acc, comment) => acc.split('\n').map(line => line.replace(github_action_helper_1.Utils.getPrefixRegExp(comment), constant_1.OPENING_COMMENT)).join('\n'), contents);
    return misc_1.getArrayInput('CLOSING_COMMENT').reduce((acc, comment) => acc.split('\n').map(line => line.replace(github_action_helper_1.Utils.getPrefixRegExp(comment), constant_1.CLOSING_COMMENT)).join('\n'), replacedOpening);
};
exports.transformWithWrap = (path, title) => {
    const content = exports.normalizeMarkerComment(fs_1.readFileSync(path, 'utf8'));
    const { toc } = transform_1.default(content, undefined, misc_1.getMaxHeaderLevel(), misc_1.wrapTitle(title), misc_1.isNoTitle(title), misc_1.getEntryPrefix());
    // transformed is not working
    // https://github.com/thlorenz/doctoc/pull/169
    const data = update_section_1.default(content, `${transform_1.start}\n${misc_1.wrapToc(toc, title)}\n${transform_1.end}`, matchesStart, matchesEnd, true);
    const transformed = data !== content;
    if (transformed) {
        return { path, transformed, data };
    }
    return { path, transformed, data: '' };
};
