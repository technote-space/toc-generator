"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transform_1 = __importStar(require("doctoc/lib/transform"));
const update_section_1 = __importDefault(require("update-section"));
const misc_1 = require("./misc");
const fs_1 = require("fs");
const matchesStart = (line) => /<!-- START doctoc /.test(line);
const matchesEnd = (line) => /<!-- END doctoc /.test(line);
exports.transformWithWrap = (path, title) => {
    const content = fs_1.readFileSync(path, 'utf8');
    const { toc } = transform_1.default(content, undefined, misc_1.getMaxHeaderLevel(), misc_1.wrapTitle(title), misc_1.isNoTitle(title), misc_1.getEntryPrefix());
    // transformed is not working
    // https://github.com/thlorenz/doctoc/pull/169
    const data = update_section_1.default(content, `${transform_1.start}\n${misc_1.wrapToc(toc, title)}\n${transform_1.end}`, matchesStart, matchesEnd, true);
    const transformed = data !== content;
    if (transformed) {
        return { path, transformed, data };
    }
    return { path, transformed };
};
