import { Action } from '../'
import * as tmp from 'tmp'
import * as fs from 'fs'

interface AdderConfig {
    start: number;
    increment: number;
}

interface AdderOutput {
    result: number;
}

interface AdderDepedencies {
    // Adder has no dependencies, so this is just an empty interface.
}

class AdderAction extends Action<AdderConfig, AdderOutput, AdderDepedencies> {
    public async act(): Promise<AdderOutput> {
        const result = this.config.start + this.config.increment

        this.logger.info(`Adding ${this.config.start} and ${this.config.increment} to get ${result}`)

        const output: AdderOutput = {
            result,
        }
        return output
    }
}

interface MulConfig {
    multiplier: number;
    multiplicand: number;
}

interface MulOutput {
    result: number;
}

interface MulDependencies {
}

class MulAction extends Action<MulConfig, MulOutput, MulDependencies> {
    public async act(): Promise<MulOutput> {
        const result = this.config.multiplier * this.config.multiplicand
        this.logger.info(`Multiplying ${this.config.multiplier} and ${this.config.multiplicand} to get ${result}`)
        const output: MulOutput = {
            result,
        }
        return output
    }
}

// (a + b) * c
interface AbcConfig {
}

interface AbcOutput {
    result: number;
}

interface AbcDependencies {
    aplusb: AdderOutput;
    c: MulOutput;
}

class AbcAction extends Action<AbcConfig, AbcOutput, AbcDependencies> {
    public async act(): Promise<AbcOutput> {
        const result = this.dependencies.aplusb.result * this.dependencies.c.result
        this.logger.info(`Multiplying ${this.dependencies.aplusb.result} and ${this.dependencies.c.result} to get ${result}`)
        const output: AbcOutput = {
            result,
        }
        return output
    }
}

describe('Action', () => {
    const tmpObj = tmp.dirSync()
    const tmpDirPath = tmpObj.name

    it('Adder', async () => {
        const config: AdderConfig = {
            start: 0,
            increment: 1,
        }
        const adderAction = new AdderAction(config, {}, tmpDirPath)

        const { filepath, output } = await adderAction.run()
        expect(output.result).toEqual(config.start + config.increment)
    })

    it('Composing two Actions', async () => {
        const adderConfig: AdderConfig = {
            start: 0,
            increment: 2,
        }
        const adderAction = new AdderAction(adderConfig, {}, tmpDirPath)
        const adderOut = await adderAction.run()

        const mulConfig: MulConfig = {
            multiplier: 5,
            multiplicand: 6,
        }
        const mulAction = new MulAction(mulConfig, {}, tmpDirPath, 'prefix')
        const mulOut = await mulAction.run()

        const abcConfig: AbcConfig = {
        }

        const abcDependencies: AbcDependencies = {
            aplusb: adderOut.output,
            c: mulOut.output,
        }

        const abcAction = new AbcAction(abcConfig, abcDependencies, tmpDirPath)
        const abcOut = await abcAction.run()

        expect(abcOut.output.result).toEqual(
            (adderConfig.start + adderConfig.increment) *
            (mulConfig.multiplier * mulConfig.multiplicand)
        )
    })

    afterAll(async () => {
        console.log(tmpDirPath)
        fs.rmSync(tmpDirPath, { recursive: true, force: true })
    })
})
