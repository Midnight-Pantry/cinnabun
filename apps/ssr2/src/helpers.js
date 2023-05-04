"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prebuild = void 0;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var esbuild_1 = require("esbuild");
var assert_1 = __importDefault(require("assert"));
function buildComponent(filePath, routeMap) {
    return __awaiter(this, void 0, void 0, function () {
        var componentName, outputPath, pathKey;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    componentName = path.join(path.dirname(filePath), path.basename(filePath));
                    outputPath = path.join(".cb", "dist", componentName.replace(".tsx", "").replace(".ts", "").replace(".jsx", "") +
                        ".js");
                    pathKey = filePath.toLowerCase();
                    if (pathKey.endsWith(path.sep)) {
                        pathKey = pathKey.substring(0, pathKey.length - 1);
                    }
                    routeMap[path.sep +
                        pathKey
                            .replace("app" + path.sep, "")
                            .replace("page.tsx", "")
                            .replace("page.jsx", "")] = outputPath;
                    return [4 /*yield*/, (0, esbuild_1.build)({
                            //bundle: true,
                            entryPoints: [filePath],
                            outfile: outputPath,
                            jsx: "transform",
                            jsxFactory: "Cinnabun.h",
                            jsxFragment: "Cinnabun.fragment",
                            jsxImportSource: "Cinnabun",
                            tsconfig: "_tsconfig.json",
                            format: "cjs",
                            target: "esnext",
                            define: {
                                "process.env.NODE_ENV": JSON.stringify("production"),
                            },
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, outputPath];
            }
        });
    });
}
function prebuild(folderPath) {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var routeMap, files, entry, page, _d, files_1, files_1_1, f, qPath, e_1_1, dir;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    routeMap = {};
                    files = fs.readdirSync(folderPath);
                    entry = files.find(function (f) { return f === "Template.tsx"; });
                    page = files.find(function (f) { return f === "Page.tsx"; });
                    (0, assert_1.default)(entry && page, "Must provide app Template.tsx & Page.tsx files");
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 11, 12, 17]);
                    _d = true, files_1 = __asyncValues(files);
                    _e.label = 2;
                case 2: return [4 /*yield*/, files_1.next()];
                case 3:
                    if (!(files_1_1 = _e.sent(), _a = files_1_1.done, !_a)) return [3 /*break*/, 10];
                    _c = files_1_1.value;
                    _d = false;
                    _e.label = 4;
                case 4:
                    _e.trys.push([4, , 8, 9]);
                    f = _c;
                    qPath = path.join(folderPath, f);
                    if (!fs.statSync(qPath).isDirectory()) return [3 /*break*/, 6];
                    return [4 /*yield*/, buildRecursive(qPath, routeMap)];
                case 5:
                    _e.sent();
                    return [3 /*break*/, 9];
                case 6: return [4 /*yield*/, buildComponent(qPath, routeMap)];
                case 7:
                    _e.sent();
                    return [3 /*break*/, 9];
                case 8:
                    _d = true;
                    return [7 /*endfinally*/];
                case 9: return [3 /*break*/, 2];
                case 10: return [3 /*break*/, 17];
                case 11:
                    e_1_1 = _e.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 17];
                case 12:
                    _e.trys.push([12, , 15, 16]);
                    if (!(!_d && !_a && (_b = files_1.return))) return [3 /*break*/, 14];
                    return [4 /*yield*/, _b.call(files_1)];
                case 13:
                    _e.sent();
                    _e.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 16: return [7 /*endfinally*/];
                case 17:
                    try {
                        dir = "./.cb";
                        if (!fs.existsSync(dir))
                            fs.mkdirSync(dir);
                        fs.writeFileSync(path.join(dir, "route-manifest.json"), JSON.stringify(routeMap));
                        // file written successfully
                    }
                    catch (err) {
                        console.error(err);
                    }
                    return [2 /*return*/, routeMap];
            }
        });
    });
}
exports.prebuild = prebuild;
function buildRecursive(folderPath, routeMap) {
    var _a, e_2, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var files, _d, files_2, files_2_1, f, qPath, e_2_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    files = fs.readdirSync(folderPath);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 11, 12, 17]);
                    _d = true, files_2 = __asyncValues(files);
                    _e.label = 2;
                case 2: return [4 /*yield*/, files_2.next()];
                case 3:
                    if (!(files_2_1 = _e.sent(), _a = files_2_1.done, !_a)) return [3 /*break*/, 10];
                    _c = files_2_1.value;
                    _d = false;
                    _e.label = 4;
                case 4:
                    _e.trys.push([4, , 8, 9]);
                    f = _c;
                    qPath = path.join(folderPath, f);
                    if (!fs.statSync(qPath).isDirectory()) return [3 /*break*/, 6];
                    return [4 /*yield*/, buildRecursive(qPath, routeMap)];
                case 5:
                    _e.sent();
                    return [3 /*break*/, 9];
                case 6: return [4 /*yield*/, buildComponent(qPath, routeMap)];
                case 7:
                    _e.sent();
                    return [3 /*break*/, 9];
                case 8:
                    _d = true;
                    return [7 /*endfinally*/];
                case 9: return [3 /*break*/, 2];
                case 10: return [3 /*break*/, 17];
                case 11:
                    e_2_1 = _e.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 17];
                case 12:
                    _e.trys.push([12, , 15, 16]);
                    if (!(!_d && !_a && (_b = files_2.return))) return [3 /*break*/, 14];
                    return [4 /*yield*/, _b.call(files_2)];
                case 13:
                    _e.sent();
                    _e.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 16: return [7 /*endfinally*/];
                case 17: return [2 /*return*/];
            }
        });
    });
}
