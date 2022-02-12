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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
exports.Animal = exports.Action = void 0;
var yaml = require("js-yaml");
var winston = require("winston");
var fs = require("fs");
var path = require("path");
var WordHash = require('wordhash');
var Action = /** @class */ (function () {
    /*
     * @param config An object containing the configuration required by this
     * Action.
     * @param dependencies An object containing output from other Actions which
     * this Action may use.
     * @param workspaceDir The directory in which to save the logfile and
     * output of the Action.
     */
    function Action(config, dependencies, workspaceDir) {
        this.dependencies = dependencies;
        this.workspaceDir = workspaceDir;
        this.config = config;
        this.constructorDate = new Date();
        this.basename = this.genBaseName(this.constructorDate);
        this.logFilepath = this.createLogFile();
        this.logger = winston.createLogger({
            format: winston.format.combine(winston.format.timestamp(), 
            // Example:
            // 2022-02-08T20:40:19.755Z [info]: "Multiplying 2 and 30 to get 60"
            winston.format.printf(function (info) {
                return "".concat(info.timestamp, " [").concat(info.level, "]: ").concat(JSON.stringify(info.message));
            })),
            transports: [
                new winston.transports.Console({ level: 'silly' }),
                new winston.transports.File({ level: 'silly', filename: this.logFilepath }),
            ]
        });
    }
    /*
     * Executes the action and writes the output using writeOutput()
     */
    Action.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var output;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.act()];
                    case 1:
                        output = _a.sent();
                        return [4 /*yield*/, this.writeOutput(output)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /*
     * Creates the workspace directory if it is absent.
     */
    Action.prototype.createWorkspaceDirIfAbsent = function () {
        if (!fs.existsSync(this.workspaceDir)) {
            fs.mkdirSync(this.workspaceDir);
        }
    };
    /*
     * Generates a base name containing the Action class name, the date, and a
     * wordhash. e.g. AdderAction.grey-dakota.20220208-2024-07
     */
    Action.prototype.genBaseName = function (date) {
        // The wordhash makes it easier to get Bash to tab-complete the
        // filename.
        var now = date;
        var wh = WordHash({ length: '2' }).hash(Math.random().toString(), now.toISOString().toString());
        var utcMonth = (now.getUTCMonth() + 1).toString();
        if (utcMonth.length === 1) {
            utcMonth = '0' + utcMonth;
        }
        var utcDate = now.getUTCDate().toString();
        if (utcDate.length === 1) {
            utcDate = '0' + utcDate;
        }
        var utcHour = now.getUTCHours().toString();
        if (utcHour.length === 1) {
            utcHour = '0' + utcHour;
        }
        var utcMin = now.getUTCMinutes().toString();
        if (utcMin.length === 1) {
            utcMin = '0' + utcMin;
        }
        var utcSecs = now.getUTCSeconds().toString();
        if (utcSecs.length === 1) {
            utcSecs = '0' + utcSecs;
        }
        var timestamp = "".concat(now.getUTCFullYear()).concat(utcMonth) +
            "".concat(utcDate, "-").concat(utcHour).concat(utcMin, "-").concat(utcSecs);
        var filename = "".concat(this.constructor.name, ".").concat(wh, ".").concat(timestamp);
        return "".concat(this.constructor.name, ".").concat(wh, ".").concat(timestamp);
    };
    /*
     * Creates an empty log file in the workspace directory.
     */
    Action.prototype.createLogFile = function () {
        this.createWorkspaceDirIfAbsent();
        var filepath = path.join(this.workspaceDir, this.basename + '.log');
        fs.writeFileSync(filepath, '');
        return filepath;
    };
    /*
     * Invoked by run(). Writes the output as a YAML file to the workspace
     * directory.
     */
    Action.prototype.writeOutput = function (output) {
        return __awaiter(this, void 0, void 0, function () {
            var filepath, ymlOut;
            return __generator(this, function (_a) {
                this.createWorkspaceDirIfAbsent();
                filepath = path.join(this.workspaceDir, this.basename + '.yml');
                ymlOut = yaml.dump(output, { indent: 4 });
                fs.writeFileSync(filepath, ymlOut);
                return [2 /*return*/, { filepath: filepath, output: output }];
            });
        });
    };
    return Action;
}());
exports.Action = Action;
var Animal = /** @class */ (function () {
    function Animal(name) {
        this.name = name;
    }
    Animal.prototype.sayName = function () {
        console.log(this.name);
    };
    return Animal;
}());
exports.Animal = Animal;
