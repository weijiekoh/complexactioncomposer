import * as yaml from 'js-yaml'
import * as winston from 'winston'
import * as fs from 'fs'
import * as path from 'path'
const WordHash = require('wordhash')

abstract class Action<Config, Output, Dependencies>{
    public logger: winston.Logger
    public logFilepath: string
    public basename: string
    public constructorDate: Date

    /*
     * @param config An object containing the configuration required by this
     * Action.
     * @param dependencies An object containing output from other Actions which
     * this Action may use.
     * @param workspaceDir The directory in which to save the logfile and
     * output of the Action.
     */
    constructor(
        public config: Config,
        public dependencies: Dependencies,
        public workspaceDir: string,
        public prefix?: string | undefined
    ) {
        this.constructorDate = new Date()
        this.basename = this.genBaseName(this.constructorDate)
        this.logFilepath = this.createLogFile()

        this.logger = winston.createLogger({
            format: winston.format.combine(
                winston.format.timestamp(),
                // Example:
                // 2022-02-08T20:40:19.755Z [info]: "Multiplying 2 and 30 to get 60"
                winston.format.printf(info => {
                    return `${info.timestamp} [${info.level}]: ${JSON.stringify(info.message)}`;
                })
            ),
            transports: [
                new winston.transports.Console({ level: 'silly' }),
                new winston.transports.File({ level: 'silly', filename: this.logFilepath }),
            ],
        })
    }

    /*
     * Executes the action and returns an Output.
     * Child classes must implement this function, but use run() to execute it.
     * The type of said Output should be defined beforehand.
     * @returns The Ouput (e.g. contract addresses).
     */
    abstract act(): Promise<Output>

    /*
     * Executes the action and writes the output using writeOutput()
     */
    public async run() {
        const output = await this.act()
        return await this.writeOutput(output)
    }

    /*
     * Creates the workspace directory if it is absent.
     */
    private createWorkspaceDirIfAbsent() {
        if (!fs.existsSync(this.workspaceDir)) {
            fs.mkdirSync(this.workspaceDir)
        }
    }

    /*
     * Generates a base name containing the Action class name, the date, and a
     * wordhash. e.g. AdderAction.grey-dakota.20220208-2024-07
     */
    public genBaseName(date: Date): string {
        // The wordhash makes it easier to get Bash to tab-complete the
        // filename.
        const now = date
        const wh = WordHash({length: '2'}).hash(
            Math.random().toString(),
            now.toISOString().toString()
        )

        let utcMonth = (now.getUTCMonth() + 1).toString()
        if (utcMonth.length === 1) {
            utcMonth = '0' + utcMonth
        }

        let utcDate = now.getUTCDate().toString()
        if (utcDate.length === 1) {
            utcDate = '0' + utcDate
        }

        let utcHour = now.getUTCHours().toString()
        if (utcHour.length === 1) {
            utcHour = '0' + utcHour
        }
        let utcMin = now.getUTCMinutes().toString()
        if (utcMin.length === 1) {
            utcMin = '0' + utcMin
        }
        let utcSecs = now.getUTCSeconds().toString()
        if (utcSecs.length === 1) {
            utcSecs = '0' + utcSecs
        }

        const timestamp = `${now.getUTCFullYear()}${utcMonth}` +
            `${utcDate}-${utcHour}${utcMin}-${utcSecs}`

        const filename = `${this.constructor.name}.${wh}.${timestamp}`

        if (this.prefix == undefined) {
            return `${this.constructor.name}.${wh}.${timestamp}`
        } else {
            return `${this.prefix}.${this.constructor.name}.${wh}.${timestamp}`
        }
    }

    /*
     * Creates an empty log file in the workspace directory.
     */
    private createLogFile(): string {
        this.createWorkspaceDirIfAbsent()

        const filepath = path.join(this.workspaceDir, this.basename + '.log')
        fs.writeFileSync(filepath, '')

        return filepath
    }

    /*
     * Invoked by run(). Writes the output as a YAML file to the workspace
     * directory.
     */
    private async writeOutput(output: Output) {
        this.createWorkspaceDirIfAbsent()

        const filepath = path.join(this.workspaceDir, this.basename + '.yml')
        const ymlOut = yaml.dump(output, { indent: 4 })
        fs.writeFileSync(filepath, ymlOut)

        return { filepath, output }
    }
}

export {
    Action,
}
